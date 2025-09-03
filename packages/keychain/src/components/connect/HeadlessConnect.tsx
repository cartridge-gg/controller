import { useConnection } from "@/hooks/connection";
import { ConnectCtx } from "@/utils/connection";
import { ResponseCodes } from "@cartridge/controller";
import { useCallback, useEffect, useState } from "react";
import { fetchController } from "./create/utils";
import { useWebauthnAuthentication } from "./create/webauthn";
import { useExternalWalletAuthentication } from "./create/external-wallet";
import { useWalletConnectAuthentication } from "./create/wallet-connect";

interface HeadlessConnectProps {
  context: ConnectCtx & { headless: { username: string; authMethod: string } };
}

export function HeadlessConnect({ context }: HeadlessConnectProps) {
  const { chainId } = useConnection();
  const { signup: signupWithWebauthn, login: loginWithWebauthn } =
    useWebauthnAuthentication();
  const { signup: signupWithExternalWallet, login: loginWithExternalWallet } =
    useExternalWalletAuthentication();
  const { signup: signupWithWalletConnect, login: loginWithWalletConnect } =
    useWalletConnectAuthentication();
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
      let controllerQuery = null;
      let isSignup = false;

      try {
        const result = await fetchController(chainId, username);
        controllerQuery = result.controller;
        isSignup = false;
      } catch (e) {
        if ((e as Error).message !== "ent: controller not found") {
          throw e;
        }
        isSignup = true;
      }

      // Handle different auth methods using existing hooks
      switch (authMethod) {
        case "webauthn": {
          if (isSignup) {
            // WebAuthn signup - This requires user interaction for credential creation
            throw new Error(
              "WebAuthn signup requires user interaction and cannot be done headlessly",
            );
          } else {
            // WebAuthn login - This also requires user interaction for credential assertion
            if (!controllerQuery) {
              throw new Error("Controller not found for login");
            }

            const webauthnCred = controllerQuery.signers?.find(
              (s) => s.metadata?.__typename === "WebauthnCredentials",
            )?.metadata;
            if (
              !webauthnCred ||
              webauthnCred.__typename !== "WebauthnCredentials"
            ) {
              throw new Error("No WebAuthn credentials found for user");
            }

            // WebAuthn requires user interaction and cannot be done headlessly
            throw new Error(
              "WebAuthn login requires user interaction and cannot be done headlessly",
            );
          }
        }

        case "metamask":
        case "rabby": {
          if (isSignup) {
            await signupWithExternalWallet(authMethod);
          } else {
            if (!controllerQuery) {
              throw new Error("Controller not found for login");
            }
            await loginWithExternalWallet(authMethod);
          }
          break;
        }

        case "walletconnect": {
          if (isSignup) {
            await signupWithWalletConnect();
          } else {
            await loginWithWalletConnect();
          }
          break;
        }

        case "google":
        case "discord": {
          // Social authentication requires OAuth flow which needs user interaction
          throw new Error(
            "Social authentication not supported in headless mode",
          );
        }

        default:
          throw new Error(`Unsupported auth method: ${authMethod}`);
      }

      // If we get here, authentication was successful
      const controller =
        "controller" in window
          ? (window as { controller?: { address: () => string } }).controller
          : undefined;
      if (!controller) {
        throw new Error("Controller not created after authentication");
      }

      context.resolve({
        code: ResponseCodes.SUCCESS,
        address: controller.address(),
      });
    } catch (e) {
      const error = e as Error;
      setError(error);
      context.resolve({
        code: ResponseCodes.ERROR,
        message: error.message,
      });
    }
  }, [
    context,
    chainId,
    signupWithWebauthn,
    loginWithWebauthn,
    signupWithExternalWallet,
    loginWithExternalWallet,
    signupWithWalletConnect,
    loginWithWalletConnect,
  ]);

  useEffect(() => {
    handleHeadlessAuth();
  }, [handleHeadlessAuth]);

  // Return null since this component doesn't render anything
  if (error) {
    console.error("Headless authentication error:", error);
  }

  return null;
}
