import { useCallback, useLayoutEffect } from "react";
import { ResponseCodes } from "@cartridge/controller";
import { useConnection } from "@/hooks/connection";
import { cleanupCallbacks } from "@/utils/connection/callbacks";
import { parseConnectParams } from "@/utils/connection/connect";
import { CreateSession, processPolicies } from "./connect/CreateSession";
import { now } from "@/constants";
import {
  useRouteParams,
  useRouteCompletion,
  useRouteCallbacks,
} from "@/hooks/route";

const CANCEL_RESPONSE = {
  code: ResponseCodes.CANCELED,
  message: "Canceled",
};

export function ConnectRoute() {
  const { controller, policies } = useConnection();

  // Parse params and set RPC URL immediately
  const params = useRouteParams((searchParams: URLSearchParams) => {
    return parseConnectParams(searchParams);
  });

  const handleCompletion = useRouteCompletion();
  useRouteCallbacks(params, CANCEL_RESPONSE);

  const handleConnect = useCallback(() => {
    if (!params || !controller) {
      return;
    }

    params.resolve?.({
      code: ResponseCodes.SUCCESS,
      address: controller.address(),
    });
    cleanupCallbacks(params.params.id);
    handleCompletion();
  }, [params, controller, handleCompletion]);

  const handleSkip = useCallback(() => {
    if (!params || !controller) {
      return;
    }

    params.resolve?.({
      code: ResponseCodes.SUCCESS,
      address: controller.address(),
    });
    cleanupCallbacks(params.params.id);
    handleCompletion();
  }, [params, controller, handleCompletion]);

  // Handle cases where we can connect immediately - use useLayoutEffect to close before render
  useLayoutEffect(() => {
    if (!params || !controller) {
      return;
    }

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

    // Bypass session approval screen for verified sessions
    if (policies.verified) {
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
          await handleCompletion();
        } catch (e) {
          console.error("Failed to create verified session:", e);
          // Fall back to showing the UI if auto-creation fails
          params.reject?.(e);
        }
      };

      void createSessionForVerifiedPolicies();
    }
  }, [params, controller, policies, handleCompletion]);

  // Don't render anything if we don't have controller yet - CreateController handles loading
  if (!controller) {
    return null;
  }

  // Don't show UI for auto-completing connections (no policies or verified policies)
  // useLayoutEffect handles closing the modal before render
  if (!policies || policies.verified) {
    return null;
  }
  return (
    <CreateSession
      policies={policies}
      onConnect={handleConnect}
      onSkip={handleSkip}
    />
  );
}
