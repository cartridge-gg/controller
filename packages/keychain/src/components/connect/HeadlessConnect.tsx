import { useConnection } from "@/hooks/connection";
import { ConnectCtx } from "@/utils/connection";
import { ResponseCodes, AuthOption } from "@cartridge/controller";
import { useCallback, useEffect, useState } from "react";
import { fetchController } from "./create/utils";
import { useCreateController } from "./create/useCreateController";

interface HeadlessConnectProps {
  context: ConnectCtx & { headless: { username: string; authMethod: string } };
}

export function HeadlessConnect({ context }: HeadlessConnectProps) {
  const { chainId, controller } = useConnection();
  const { handleSubmit } = useCreateController({ isSlot: false });
  const [error, setError] = useState<Error>();

  const handleHeadlessAuth = useCallback(async () => {
    if (!chainId) {
      const error = new Error("Chain ID not available");
      setError(error);
      context.reject(error);
      return;
    }

    try {
      const { username, authMethod } = context.headless!;

      // Check if user exists by fetching controller
      let userExists = false;

      try {
        const result = await fetchController(chainId, username);
        userExists = !!result.controller;
      } catch (e) {
        if ((e as Error).message !== "ent: controller not found") {
          throw e;
        }
        userExists = false;
      }

      // Validate auth method for headless mode
      switch (authMethod) {
        case "webauthn": {
          // WebAuthn requires user interaction and cannot be done headlessly
          throw new Error(
            "WebAuthn requires user interaction and cannot be done headlessly",
          );
        }

        case "google":
        case "discord": {
          // Social authentication requires OAuth flow which needs user interaction
          throw new Error(
            "Social authentication not supported in headless mode",
          );
        }

        case "metamask":
        case "rabby":
        case "walletconnect": {
          // These are supported, continue with authentication
          await handleSubmit(username, userExists, authMethod as AuthOption);
          break;
        }

        default:
          throw new Error(`Unsupported auth method: ${authMethod}`);
      }
    } catch (e) {
      const error = e as Error;
      setError(error);
      context.resolve({
        code: ResponseCodes.ERROR,
        message: error.message,
      });
    }
  }, [context, chainId, handleSubmit]);

  useEffect(() => {
    handleHeadlessAuth();
  }, [handleHeadlessAuth]);

  // Watch for controller to be set and resolve when ready
  useEffect(() => {
    if (controller) {
      context.resolve({
        code: ResponseCodes.SUCCESS,
        address: controller.address(),
      });
    }
  }, [controller, context]);

  // Return null since this component doesn't render anything
  if (error) {
    console.error("Headless authentication error:", error);
  }

  return null;
}
