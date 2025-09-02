import { DEFAULT_SESSION_DURATION, now } from "@/constants";
import { doLogin, doSignup } from "@/hooks/account";
import { useConnection } from "@/hooks/connection";
import Controller from "@/utils/controller";
import { Owner } from "@cartridge/controller-wasm";
import { ControllerQuery } from "@cartridge/ui/utils/api/cartridge";
import { useCallback } from "react";
import { shortString } from "starknet";
import { LoginMode } from "../../types";

export function useWebauthnAuthentication() {
  const { origin, rpcUrl, chainId, setController } = useConnection();

  const signup = useCallback(
    async (username: string, doPopupFlow: (username: string) => void) => {
      if (!chainId) throw new Error("No chainId found");

      // Signup flow
      const isSafari = /^((?!chrome|android).)*safari/i.test(
        navigator.userAgent,
      );

      if (isSafari) {
        doPopupFlow(username);
        return;
      }

      const data = await doSignup(
        username,
        shortString.decodeShortString(chainId),
      );

      const {
        username: finalUsername,
        controllers,
        credentials,
      } = data?.finalizeRegistration ?? {};

      if (!credentials?.webauthn) return;

      const { id: credentialId, publicKey } = credentials.webauthn?.[0] ?? {};
      const controllerNode = controllers?.edges?.[0]?.node;

      if (!controllerNode || !finalUsername || !chainId || !rpcUrl || !origin)
        return;

      const controller = await Controller.create({
        appId: origin,
        classHash: controllerNode.constructorCalldata[0],
        chainId: shortString.decodeShortString(chainId),
        rpcUrl,
        address: controllerNode.address,
        username: finalUsername,
        owner: {
          signer: {
            webauthn: {
              rpId: import.meta.env.VITE_RP_ID!,
              credentialId,
              publicKey,
            },
          },
        },
      });

      window.controller = controller;
      setController(controller);
    },
    [origin, rpcUrl, chainId, setController],
  );

  const login = useCallback(
    async (
      controller: ControllerQuery["controller"],
      webauthnsSigner: Owner,
      loginMode: LoginMode,
      isSlot: boolean,
    ) => {
      if (!controller) throw new Error("No controller found");
      if (!chainId) throw new Error("No chainId found");

      let controllerObject: Controller;
      if (loginMode === LoginMode.Webauthn) {
        const webauthnCredential = webauthnsSigner.signer?.webauthns?.[0];
        if (
          !webauthnCredential ||
          !webauthnCredential.publicKey ||
          !webauthnCredential.credentialId
        ) {
          throw new Error("WebAuthn credentials are missing");
        }

        await doLogin({
          name: controller.accountID,
          credentialId: webauthnCredential.credentialId,
          finalize: !!isSlot,
        });

        controllerObject = Controller.create({
          appId: origin,
          classHash: controller.constructorCalldata[0],
          chainId,
          rpcUrl: rpcUrl,
          address: controller.address,
          username: controller.accountID,
          owner: {
            signer: {
              webauthn: {
                rpId: webauthnCredential.rpId || import.meta.env.VITE_RP_ID!,
                credentialId: webauthnCredential.credentialId,
                publicKey: webauthnCredential.publicKey,
              },
            },
          },
        });
      } else {
        const { controller: loginController } = await Controller.login({
          appId: origin,
          classHash: controller.constructorCalldata[0],
          rpcUrl,
          chainId,
          address: controller.address,
          username: controller.accountID,
          owner: webauthnsSigner,
          cartridgeApiUrl: import.meta.env.VITE_CARTRIDGE_API_URL,
          session_expires_at_s: Number(now() + DEFAULT_SESSION_DURATION),
          isControllerRegistered: true,
        });
        controllerObject = loginController;
      }

      window.controller = controllerObject;
      setController(controllerObject);
    },
    [chainId, rpcUrl, origin, setController],
  );

  return {
    signup,
    login,
  };
}
