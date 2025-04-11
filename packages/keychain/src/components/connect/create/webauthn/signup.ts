import { doSignup } from "@/hooks/account";
import { useConnection } from "@/hooks/connection";
import { useCallback } from "react";
import { constants } from "starknet";
import { createController } from "../useCreateController";

export function useSignupWithWebauthn() {
  const { origin, rpcUrl, chainId, setController } = useConnection();

  const signupWithWebauthn = useCallback(
    async (username: string, doPopupFlow: (username: string) => void) => {
      // Signup flow
      const isSafari = /^((?!chrome|android).)*safari/i.test(
        navigator.userAgent,
      );

      if (isSafari) {
        doPopupFlow(username);
        return;
      }

      const data = await doSignup(username, constants.NetworkName.SN_MAIN);

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
        credentialId,
        publicKey,
      );

      window.controller = controller;
      setController(controller);
    },
    [origin, rpcUrl, chainId, setController],
  );

  return signupWithWebauthn;
}
