import { useCallback, useEffect, useMemo, useState } from "react";
import { ResponseCodes } from "@cartridge/controller";
import { useConnection } from "@/hooks/connection";
import { hasApprovalPolicies } from "@/hooks/session";
import { cleanupCallbacks } from "@/utils/connection/callbacks";
import { parseConnectParams } from "@/utils/connection/connect";
import { CreateSession } from "./connect/CreateSession";
import {
  createVerifiedSession,
  requiresSessionApproval,
} from "@/utils/connection/session-creation";
import {
  useRouteParams,
  useRouteCompletion,
  useRouteCallbacks,
} from "@/hooks/route";
import { isIframe } from "@cartridge/ui/utils";
import { safeRedirect } from "@/utils/url-validator";
import { requestStorageAccess } from "@/utils/connection/storage-access";
import { posthog } from "@/components/provider/posthog";
import {
  Button,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/ui";
import { ControllerErrorAlert } from "@/components/ErrorAlert";

const CANCEL_RESPONSE = {
  code: ResponseCodes.CANCELED,
  message: "Canceled",
};

// Chrome on iOS uses WebKit under the hood and requires a user gesture
// for navigator.credentials.get(). Auto session creation in useEffect
// fails silently, so we show a "Continue" button instead.
const isChromeIOS =
  typeof navigator !== "undefined" && /CriOS/i.test(navigator.userAgent);

export function ConnectRoute() {
  const { controller, policies, origin, theme } = useConnection();
  const [hasAutoConnected, setHasAutoConnected] = useState(false);
  const [isSessionCreating, setIsSessionCreating] = useState(false);
  const [sessionError, setSessionError] = useState<Error>();
  const [showContinueButton, setShowContinueButton] = useState(false);

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

  const clearConnectParams = useCallback(() => {
    const url = new URL(window.location.href);
    url.search = "";
    window.history.replaceState(null, "", url.toString());
  }, []);

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
    clearConnectParams();

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
  }, [
    params,
    controller,
    clearConnectParams,
    handleCompletion,
    isStandalone,
    redirectUrl,
  ]);

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
    clearConnectParams();

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
  }, [
    params,
    controller,
    clearConnectParams,
    handleCompletion,
    isStandalone,
    redirectUrl,
  ]);

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
    if (!requiresSessionApproval(policies)) {
      const createSessionForVerifiedPolicies = async () => {
        try {
          await createVerifiedSession({
            controller,
            origin,
            policies,
          });
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
          posthog.capture("Verified Session Creation Failed", {
            error: e instanceof Error ? e.message : String(e),
            errorName: e instanceof Error ? e.name : undefined,
            userAgent: navigator.userAgent,
            isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
            isChromeIOS,
          });

          if (isChromeIOS) {
            // Chrome iOS requires a user gesture for navigator.credentials.get().
            // Show a "Continue" button so the user tap provides the gesture.
            setShowContinueButton(true);
          } else {
            // Fall back to rejecting on other browsers
            params.reject?.(e);
          }
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
    // Auto session creation failed on Chrome iOS — show a "Continue" button
    // so the user tap provides the gesture required by WebAuthn.
    if (showContinueButton) {
      const handleContinue = async () => {
        if (!controller) return;
        setIsSessionCreating(true);
        setSessionError(undefined);
        try {
          await createVerifiedSession({ controller, origin, policies });
          params?.resolve?.({
            code: ResponseCodes.SUCCESS,
            address: controller.address(),
          });
          if (params?.params.id) {
            cleanupCallbacks(params.params.id);
          }
          handleCompletion();
        } catch (e) {
          console.error("Failed to create verified session:", e);
          posthog.capture("Verified Session Creation Failed (Continue)", {
            error: e instanceof Error ? e.message : String(e),
            errorName: e instanceof Error ? e.name : undefined,
            userAgent: navigator.userAgent,
            isChromeIOS: true,
          });
          setSessionError(e instanceof Error ? e : new Error(String(e)));
        } finally {
          setIsSessionCreating(false);
        }
      };

      return (
        <>
          <HeaderInner
            className="pb-0"
            title={theme ? theme.name : "Create Session"}
          />
          <LayoutContent />
          <LayoutFooter>
            {sessionError && (
              <ControllerErrorAlert className="mb-3" error={sessionError} />
            )}
            <Button
              className="w-full"
              disabled={isSessionCreating}
              isLoading={isSessionCreating}
              onClick={() => void handleContinue()}
            >
              continue
            </Button>
          </LayoutFooter>
        </>
      );
    }

    // Auto-creation either succeeded or is in progress
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
