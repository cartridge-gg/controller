import { DEFAULT_SESSION_DURATION, now } from "@/const";
import { doLogin, doSignup } from "@/hooks/account";
import { useConnection } from "@/hooks/connection";
import {
  ControllerQuery,
  WebauthnCredential,
} from "@cartridge/ui/utils/api/cartridge";
import { useCallback } from "react";
import { shortString } from "starknet";
import { LoginMode } from "../../types";
import { createController } from "../useCreateController";

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

      const controller = await createController(
        origin,
        chainId,
        rpcUrl,
        finalUsername,
        controllerNode.constructorCalldata[0],
        controllerNode.address,
        {
          signer: {
            webauthn: {
              rpId: import.meta.env.VITE_RP_ID!,
              credentialId,
              publicKey,
            },
          },
        },
      );

      window.controller = controller;
      setController(controller);
    },
    [origin, rpcUrl, chainId, setController],
  );

  const login = useCallback(
    async (
      controller: ControllerQuery["controller"],
      credential: WebauthnCredential,
      loginMode: LoginMode,
      isSlot: boolean,
    ) => {
      if (!controller) throw new Error("No controller found");

      const controllerObject = await createController(
        origin!,
        chainId!,
        rpcUrl!,
        controller.accountID,
        controller.constructorCalldata[0],
        controller.address,
        {
          signer: {
            webauthn: {
              rpId: import.meta.env.VITE_RP_ID!,
              credentialId: credential.id,
              publicKey: credential.publicKey,
            },
          },
        },
      );

      if (loginMode === LoginMode.Webauthn) {
        await doLogin({
          name: controller.accountID,
          credentialId: credential.id,
          finalize: !!isSlot,
        });
      } else {
        await controllerObject.login(now() + DEFAULT_SESSION_DURATION, true);
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
