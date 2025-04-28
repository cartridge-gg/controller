import { DEFAULT_SESSION_DURATION, now } from "@/const";
import { doLogin, doSignup } from "@/hooks/account";
import { useConnection } from "@/hooks/connection";
import { ControllerQuery } from "@cartridge/utils/api/cartridge";
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
      controller: ControllerQuery["controller"],
      loginMode: LoginMode,
      isSlot: boolean,
    ) => {
      if (!controller) throw new Error("No controller found");

      const { account } = controller ?? {};
      const { id: credentialId, publicKey } =
        account?.credentials?.webauthn?.[0] ?? {};

      if (!credentialId)
        throw new Error("No credential ID found for this account");

      if (!publicKey) {
        return;
      }

      const controllerObject = await createController(
        origin!,
        chainId!,
        rpcUrl!,
        account.username,
        controller.constructorCalldata[0],
        controller.address,
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
        await controllerObject.login(now() + DEFAULT_SESSION_DURATION);
      }

      window.controller = controllerObject;
      setController(controllerObject);
    },
    [chainId, rpcUrl, origin],
  );

  return { signup, login };
}
