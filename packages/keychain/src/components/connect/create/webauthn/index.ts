import { DEFAULT_SESSION_DURATION, now } from "@/const";
import { doLogin, doSignup } from "@/hooks/account";
import { useConnection } from "@/hooks/connection";
import { AccountQuery } from "@cartridge/utils/api/cartridge";
import { useCallback } from "react";
import { constants } from "starknet";
import { LoginMode } from "../../types";
import { createController } from "../useCreateController";

export function useWebauthnAuthentication() {
  const { origin, rpcUrl, chainId, setController } = useConnection();

  const signup = useCallback(
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

  const login = useCallback(
    async (
      account: AccountQuery["account"],
      loginMode: LoginMode,
      isSlot: boolean,
    ) => {
      if (!account) throw new Error("No account found");

      const { credentials, controllers } = account ?? {};
      const { id: credentialId, publicKey } = credentials?.webauthn?.[0] ?? {};

      const controllerNode = controllers?.edges?.[0]?.node;

      if (!credentialId)
        throw new Error("No credential ID found for this account");

      if (!controllerNode || !publicKey) {
        return;
      }

      const controller = await createController(
        origin!,
        chainId!,
        rpcUrl!,
        account.username,
        controllerNode.constructorCalldata[0],
        controllerNode.address,
        credentialId,
        publicKey,
      );

      if (loginMode === LoginMode.Webauthn) {
        await doLogin({
          name: account.username,
          credentialId,
          finalize: !!isSlot,
        });
      } else {
        await controller.login(now() + DEFAULT_SESSION_DURATION);
      }

      window.controller = controller;
      setController(controller);
    },
    [chainId, rpcUrl, origin],
  );

  return { signup, login };
}
