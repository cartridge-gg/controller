import { useCallback } from "react";
import { ResponseCodes } from "@cartridge/controller";
import { useConnection } from "@/hooks/connection";
import { cleanupCallbacks } from "@/utils/connection/callbacks";
import { parseConnectParams } from "@/utils/connection/connect";
import { CreateSession } from "./connect/CreateSession";
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

  // Don't render anything if we don't have controller yet - CreateController handles loading
  if (!controller) {
    return null;
  }

  // No policies and verified policies are handled in useCreateController
  // This component only handles unverified policies that need user consent
  if (!policies) {
    // This should not be reached as no policies case is handled in useCreateController
    return null;
  }

  if (policies.verified) {
    // This should not be reached as verified policies are handled in useCreateController
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
