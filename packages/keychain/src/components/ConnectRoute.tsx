import { useCallback, useEffect, useMemo, useRef } from "react";
import { ResponseCodes } from "@cartridge/controller";
import { useConnection } from "@/hooks/connection";
import { hasApprovalPolicies } from "@/hooks/session";
import { cleanupCallbacks } from "@/utils/connection/callbacks";
import { parseConnectParams } from "@/utils/connection/connect";
import { CreateSession, processPolicies } from "./connect/CreateSession";
import { StandaloneConnect } from "./connect";
import { now } from "@/constants";
import {
  useRouteParams,
  useRouteCompletion,
  useRouteCallbacks,
} from "@/hooks/route";
import { isIframe } from "@cartridge/ui/utils";
import { safeRedirect } from "@/utils/url-validator";
import { ConnectionSuccess } from "./connect/ConnectionSuccess";

const CANCEL_RESPONSE = {
  code: ResponseCodes.CANCELED,
  message: "Canceled",
};

export function ConnectRoute() {
  const {
    controller,
    policies,
    verified,
    authMethod,
    isNewUser,
    showSuccessScreen,
    setShowSuccessScreen,
  } = useConnection();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle timeout to hide success screen after 1 second
  useEffect(() => {
    if (showSuccessScreen && controller && !timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        setShowSuccessScreen(false);
        timeoutRef.current = null;
      }, 1000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [showSuccessScreen, controller, setShowSuccessScreen]);

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

  const handleConnect = useCallback(() => {
    if (!params || !controller) {
      return;
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
    if (isStandalone && redirectUrl) {
      safeRedirect(redirectUrl, true);
      return;
    }

    handleCompletion();
  }, [params, controller, handleCompletion, isStandalone, redirectUrl]);

  const handleSkip = useCallback(() => {
    if (!params || !controller) {
      return;
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
    if (isStandalone && redirectUrl) {
      safeRedirect(redirectUrl, true);
      return;
    }

    handleCompletion();
  }, [params, controller, handleCompletion, isStandalone, redirectUrl]);

  // Handle cases where we can connect immediately (embedded mode only)
  // Don't run if we're showing success screen
  useEffect(() => {
    if (!params || !controller || showSuccessScreen) {
      return;
    }

    // In standalone mode with redirect_url, don't auto-connect
    // Show UI to let user manually connect
    if (isStandalone && redirectUrl) {
      return;
    }

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
    if (policies.verified && !isStandalone) {
      if (hasTokenApprovals) {
        return;
      }

      const createSessionForVerifiedPolicies = async () => {
        try {
          // Use a default duration for verified sessions (24 hours)
          const duration = BigInt(24 * 60 * 60); // 24 hours in seconds
          const expiresAt = duration + now();

          const processedPolicies = processPolicies(policies, false);
          await controller.createSession(expiresAt, processedPolicies);
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
    showSuccessScreen,
    setShowSuccessScreen,
    hasTokenApprovals,
  ]);

  // Don't render anything if we don't have controller yet - CreateController handles loading
  if (!controller) {
    return null;
  }

  // Show success screen for 1 second when controller is first created
  if (showSuccessScreen) {
    return <ConnectionSuccess isNew={isNewUser} authMethod={authMethod} />;
  }

  // In standalone mode with redirect_url, show connect UI
  if (isStandalone && redirectUrl) {
    // If verified session without approvals, show simple connect screen
    if (!policies || (policies.verified && !hasTokenApprovals)) {
      return (
        <StandaloneConnect redirectUrl={redirectUrl} isVerified={verified} />
      );
    }
    // If unverified session with policies, show CreateSession for consent
    return (
      <CreateSession
        policies={policies}
        onConnect={handleConnect}
        onSkip={handleSkip}
      />
    );
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

  // Show CreateSession for sessions that require approval UI in embedded mode

  return (
    <CreateSession
      policies={policies}
      onConnect={handleConnect}
      onSkip={handleSkip}
    />
  );
}
