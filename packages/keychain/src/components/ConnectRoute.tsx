import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ResponseCodes, AuthOption } from "@cartridge/controller";
import { useConnection } from "@/hooks/connection";
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
  const { controller, policies, verified } = useConnection();

  // Check for success screen synchronously on mount (before first render)
  const shouldShowSuccess = sessionStorage.getItem("showSuccess");
  const authMethodStr = sessionStorage.getItem("authMethod");
  const isNewStr = sessionStorage.getItem("isNew");

  const [hasAutoConnected, setHasAutoConnected] = useState(() => {
    // If we should show success, mark as auto-connected immediately
    return shouldShowSuccess === "true";
  });

  const [showSuccess, setShowSuccess] = useState(() => {
    return shouldShowSuccess === "true" && !!controller;
  });

  const [authMethod, setAuthMethod] = useState<AuthOption | undefined>(() => {
    if (authMethodStr) {
      try {
        return JSON.parse(authMethodStr) as AuthOption;
      } catch (e) {
        console.error("Failed to parse authMethod:", e);
      }
    }
    return undefined;
  });

  const [isNew, setIsNew] = useState<boolean | undefined>(() => {
    return isNewStr === "true";
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if we should show success screen (controller just created)
  // This handles both initial mount and when controller becomes available after mount
  useEffect(() => {
    const checkShowSuccess = sessionStorage.getItem("showSuccess");

    // If we should show success and controller exists
    if (checkShowSuccess === "true" && controller) {
      // If showSuccess is not already true, set it
      if (!showSuccess) {
        setShowSuccess(true);
        // Mark as auto-connected to prevent immediate auto-connect
        setHasAutoConnected(true);

        // Get auth info if not already set
        const authMethodStr = sessionStorage.getItem("authMethod");
        const isNewStr = sessionStorage.getItem("isNew");

        if (authMethodStr && !authMethod) {
          try {
            setAuthMethod(JSON.parse(authMethodStr) as AuthOption);
          } catch (e) {
            console.error("Failed to parse authMethod:", e);
          }
        }

        if (isNewStr && isNew === undefined) {
          setIsNew(isNewStr === "true");
        }
      } else {
        // If already showing, still mark as auto-connected
        setHasAutoConnected(true);
      }

      // Clear sessionStorage
      sessionStorage.removeItem("showSuccess");
      sessionStorage.removeItem("authMethod");
      sessionStorage.removeItem("isNew");
    }
  }, [controller, showSuccess, authMethod, isNew]);

  // Separate effect to handle timeout whenever showSuccess is true
  useEffect(() => {
    if (showSuccess && controller && !timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        setShowSuccess(false);
        // Reset hasAutoConnected so auto-connect can happen after success screen
        setHasAutoConnected(false);
        timeoutRef.current = null;
      }, 1000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [showSuccess, controller]);

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

  const handleConnect = useCallback(() => {
    if (!params || !controller) {
      return;
    }

    params.resolve?.({
      code: ResponseCodes.SUCCESS,
      address: controller.address(),
    });
    cleanupCallbacks(params.params.id);

    // In standalone mode with redirect_url, redirect instead of calling handleCompletion
    if (isStandalone && redirectUrl) {
      safeRedirect(redirectUrl);
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
    cleanupCallbacks(params.params.id);

    // In standalone mode with redirect_url, redirect instead of calling handleCompletion
    if (isStandalone && redirectUrl) {
      safeRedirect(redirectUrl);
      return;
    }

    handleCompletion();
  }, [params, controller, handleCompletion, isStandalone, redirectUrl]);

  // Handle cases where we can connect immediately (embedded mode only)
  // Don't run if we're showing success screen
  useEffect(() => {
    if (!params || !controller || hasAutoConnected || showSuccess) {
      return;
    }

    // In standalone mode with redirect_url, don't auto-connect
    // Show UI to let user manually connect
    if (isStandalone && redirectUrl) {
      return;
    }

    // Mark as auto-connected immediately to prevent race conditions
    setHasAutoConnected(true);

    // if no policies, we can connect immediately
    if (!policies) {
      params.resolve?.({
        code: ResponseCodes.SUCCESS,
        address: controller.address(),
      });
      cleanupCallbacks(params.params.id);
      handleCompletion();
      return;
    }

    // Bypass session approval screen for verified sessions in embedded mode
    if (policies.verified && !isStandalone) {
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
          cleanupCallbacks(params.params.id);
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
    showSuccess,
  ]);

  // Don't render anything if we don't have controller yet - CreateController handles loading
  if (!controller) {
    return null;
  }

  // Show success screen for 1 seconds when controller is first created
  if (showSuccess) {
    return <ConnectionSuccess isNew={isNew} authMethod={authMethod} />;
  }

  // In standalone mode with redirect_url, show connect UI
  if (isStandalone && redirectUrl) {
    // If verified session, show simple connect screen
    if (!policies || policies.verified) {
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

  if (policies.verified) {
    // This should not be reached as verified policies are handled in useCreateController
    return null;
  }

  // Show CreateSession for unverified sessions in embedded mode
  return (
    <CreateSession
      policies={policies}
      onConnect={handleConnect}
      onSkip={handleSkip}
    />
  );
}
