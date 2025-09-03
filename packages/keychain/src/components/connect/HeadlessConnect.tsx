import { useConnection } from "@/hooks/connection";
import { ConnectCtx } from "@/utils/connection";
import { ResponseCodes } from "@cartridge/controller";
import { useCallback, useEffect, useState } from "react";
import { fetchController } from "./create/utils";

interface HeadlessConnectProps {
  context: ConnectCtx & { headless: { username: string; authMethod: string } };
}

export function HeadlessConnect({ context }: HeadlessConnectProps) {
  const { chainId } = useConnection();
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
      try {
        await fetchController(chainId, username);
        // User exists - this would be a login flow
      } catch (e) {
        if ((e as Error).message !== "ent: controller not found") {
          throw e;
        }
        // User doesn't exist - this would be a signup flow
      }

      // Handle different auth methods
      switch (authMethod) {
        case "webauthn": {
          // Use existing webauthn authentication hooks
          // This would need to be implemented to work headlessly
          throw new Error(
            "WebAuthn headless authentication not yet implemented",
          );
        }

        case "metamask":
        case "rabby": {
          // Use external wallet authentication
          // This would need to be implemented to work headlessly
          throw new Error(
            "External wallet headless authentication not yet implemented",
          );
        }

        case "google":
        case "discord": {
          // Social authentication might not be feasible headlessly
          throw new Error(
            "Social authentication not supported in headless mode",
          );
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
  }, [context, chainId]);

  useEffect(() => {
    handleHeadlessAuth();
  }, [handleHeadlessAuth]);

  // Return null since this component doesn't render anything
  if (error) {
    console.error("Headless authentication error:", error);
  }

  return null;
}
