import { DEFAULT_SESSION_DURATION, now } from "@/constants";
import { doSignup } from "@/hooks/account";
import { useConnection } from "@/hooks/connection";
import Controller from "@/utils/controller";
import { Owner } from "@cartridge/controller-wasm";
import { ControllerQuery } from "@cartridge/ui/utils/api/cartridge";
import { useCallback } from "react";
import { shortString } from "starknet";

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
        classHash: controllerNode.constructorCalldata[0],
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
      controllerQuery: ControllerQuery["controller"],
      webauthnsSigner: Owner,
      isSlot: boolean,
    ) => {
      if (!controllerQuery) throw new Error("No controller found");
      if (!chainId) throw new Error("No chainId found");

      let controller: Controller;
      if (isSlot) {
        controller = await Controller.apiLogin({
          classHash: controllerQuery.constructorCalldata[0],
          rpcUrl,
          address: controllerQuery.address,
          username: controllerQuery.accountID,
          owner: webauthnsSigner,
        });
      } else {
        const { controller: loginController } = await Controller.login({
          appId: origin,
          classHash: controllerQuery.constructorCalldata[0],
          rpcUrl,
          address: controllerQuery.address,
          username: controllerQuery.accountID,
          owner: webauthnsSigner,
          cartridgeApiUrl: import.meta.env.VITE_CARTRIDGE_API_URL,
          session_expires_at_s: Number(now() + DEFAULT_SESSION_DURATION),
          isControllerRegistered: true,
        });
        controller = loginController;
      }

      window.controller = controller;
      setController(controller);
    },
    [chainId, rpcUrl, origin, setController],
  );

  return {
    signup,
    login,
  };
}
