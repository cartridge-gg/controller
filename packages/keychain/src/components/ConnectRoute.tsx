import { useCallback, useEffect, useMemo, useState } from "react";
import { ResponseCodes } from "@cartridge/controller";
import { useConnection } from "@/hooks/connection";
import { hasApprovalPolicies } from "@/hooks/session";
import { cleanupCallbacks } from "@/utils/connection/callbacks";
import { parseConnectParams } from "@/utils/connection/connect";
import { CreateSession, processPolicies } from "./connect/CreateSession";
import { now } from "@/constants";
import {
  useRouteParams,
  useRouteCompletion,
  useRouteCallbacks,
} from "@/hooks/route";
import { isIframe } from "@cartridge/ui/utils";
import { safeRedirect } from "@/utils/url-validator";
import { requestStorageAccess } from "@/utils/connection/storage-access";

const CANCEL_RESPONSE = {
  code: ResponseCodes.CANCELED,
  message: "Canceled",
};

export function ConnectRoute() {
  const { controller, policies, origin } = useConnection();
  const [hasAutoConnected, setHasAutoConnected] = useState(false);

  // Parse params and set RPC URL immediately
  const params = useRouteParams((searchParams: URLSearchParams) => {
    return parseConnectParams(searchParams);
  });

  const handleCompletion = useRouteCompletion();

  useRouteCallbacks(params, CANCEL_RESPONSE);

  // Check if this is standalone mode (not in iframe)
  const isStandalone = useMemo(() => !isIframe(), []);

  // Get redirect_url from query params for standalone mode
  const redirectUrl = useMemo(() => {
    if (isStandalone) {
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.get("redirect_url");
    }
    return null;
  }, [isStandalone]);

  const hasTokenApprovals = useMemo(
    () => hasApprovalPolicies(policies),
    [policies],
  );

  const handleConnect = useCallback(async () => {
    if (!params || !controller) {
      return;
    }

    // In iframe context, request storage access on user gesture so
    // third-party storage can persist across app restarts.
    if (!isStandalone) {
      try {
        await requestStorageAccess();
      } catch (error) {
        console.error("[ConnectRoute] Storage access request failed:", error);
      }
    }

    params.resolve?.({
      code: ResponseCodes.SUCCESS,
      address: controller.address(),
    });
    if (params.params.id) {
      cleanupCallbacks(params.params.id);
    }

    // In standalone mode with redirect_url, redirect instead of calling handleCompletion
    // Add lastUsedConnector query param to indicate controller was used
    // if (isStandalone && redirectUrl) {
    //   console.log("redirecting");
    //   try {
    //     // Create encrypted snapshot and append to URL fragment
    //     const encryptedBlob = await snapshotLocalStorageToCookie();
    //     const redirectWithFragment =
    //       encryptedBlob && encryptedBlob.length > 0
    //         ? mergeUrlFragment(redirectUrl, {
    //             kc: encryptedBlob,
    //           })
    //         : redirectUrl;
    //     safeRedirect(redirectWithFragment, true);
    //   } catch (error) {
    //     console.error(
    //       "[ConnectRoute] Failed to create storage snapshot:",
    //       error,
    //     );
    //     // Continue with redirect even if snapshot fails
    //     safeRedirect(redirectUrl, true);
    //   }
    //   return;
    // }

    if (isStandalone && redirectUrl) {
      safeRedirect(redirectUrl, true);
      return;
    }

    handleCompletion();
  }, [params, controller, handleCompletion, isStandalone, redirectUrl]);

  const handleSkip = useCallback(async () => {
    if (!params || !controller) {
      return;
    }

    if (!isStandalone) {
      try {
        await requestStorageAccess();
      } catch (error) {
        console.error("[ConnectRoute] Storage access request failed:", error);
      }
    }

    params.resolve?.({
      code: ResponseCodes.SUCCESS,
      address: controller.address(),
    });
    if (params.params.id) {
      cleanupCallbacks(params.params.id);
    }

    // In standalone mode with redirect_url, redirect instead of calling handleCompletion
    // Add lastUsedConnector query param to indicate controller was used
    // if (isStandalone && redirectUrl) {
    //   console.log("redirecting skip");
    //   try {
    //     // Create encrypted snapshot and append to URL fragment
    //     const encryptedBlob = await snapshotLocalStorageToCookie();
    //     const redirectWithFragment =
    //       encryptedBlob && encryptedBlob.length > 0
    //         ? mergeUrlFragment(redirectUrl, {
    //             kc: encryptedBlob,
    //           })
    //         : redirectUrl;
    //     safeRedirect(redirectWithFragment, true);
    //   } catch (error) {
    //     console.error(
    //       "[ConnectRoute] Failed to create storage snapshot:",
    //       error,
    //     );
    //     // Continue with redirect even if snapshot fails
    //     safeRedirect(redirectUrl, true);
    //   }
    //   return;
    // }

    if (isStandalone && redirectUrl) {
      safeRedirect(redirectUrl, true);
      return;
    }

    handleCompletion();
  }, [params, controller, handleCompletion, isStandalone, redirectUrl]);

  // Handle cases where we can connect immediately (embedded mode only)
  useEffect(() => {
    if (!params || !controller || hasAutoConnected) {
      return;
    }

    // In standalone mode with redirect_url, redirect immediately
    // if (isStandalone && redirectUrl) {
    //   console.log("redirecting effect");
    //   (async () => {
    //     try {
    //       // Create encrypted snapshot and append to URL fragment
    //       const encryptedBlob = await snapshotLocalStorageToCookie();
    //       const redirectWithFragment =
    //         encryptedBlob && encryptedBlob.length > 0
    //           ? mergeUrlFragment(redirectUrl, {
    //               kc: encryptedBlob,
    //             })
    //           : redirectUrl;
    //       safeRedirect(redirectWithFragment, true);
    //     } catch (error) {
    //       console.error(
    //         "[ConnectRoute] Failed to create storage snapshot:",
    //         error,
    //       );
    //       // Continue with redirect even if snapshot fails
    //       safeRedirect(redirectUrl, true);
    //     }
    //   })();
    //   return;
    // }

    // Mark as auto-connected immediately to prevent race conditions
    setHasAutoConnected(true);

    // if no policies, we can connect immediately
    if (!policies) {
      params.resolve?.({
        code: ResponseCodes.SUCCESS,
        address: controller.address(),
      });

      if (params.params.id) {
        cleanupCallbacks(params.params.id);
      }
      handleCompletion();
      return;
    }

    // Bypass session approval screen for verified sessions in embedded mode
    // Note: This is a fallback - main logic is handled in useCreateController
    if (policies.verified) {
      if (hasTokenApprovals) {
        return;
      }

      const createSessionForVerifiedPolicies = async () => {
        try {
          // Use a default duration for verified sessions (24 hours)
          const duration = BigInt(24 * 60 * 60); // 24 hours in seconds
          const expiresAt = duration + now();

          const processedPolicies = processPolicies(policies, false);
          await controller.createSession(origin, expiresAt, processedPolicies);
          params.resolve?.({
            code: ResponseCodes.SUCCESS,
            address: controller.address(),
          });
          if (params.params.id) {
            cleanupCallbacks(params.params.id);
          }
          handleCompletion();
        } catch (e) {
          console.error("Failed to create verified session:", e);
          // Fall back to showing the UI if auto-creation fails
          params.reject?.(e);
        }
      };

      void createSessionForVerifiedPolicies();
    }
  }, [
    params,
    controller,
    policies,
    handleCompletion,
    isStandalone,
    redirectUrl,
    hasAutoConnected,
    hasTokenApprovals,
    origin,
  ]);

  // Don't render anything if we don't have controller yet - CreateController handles loading
  if (!controller) {
    return null;
  }

  // Embedded mode: No policies and verified policies are handled in useCreateController
  // This component only handles unverified policies that need user consent
  if (!policies) {
    // This should not be reached as no policies case is handled in useCreateController
    return null;
  }

  if (policies.verified && !hasTokenApprovals) {
    // This should not be reached as verified policies are handled in useCreateController
    return null;
  }

  // Show CreateSession for sessions that require approval UI

  return (
    <CreateSession
      policies={policies}
      onConnect={handleConnect}
      onSkip={handleSkip}
    />
  );
}
