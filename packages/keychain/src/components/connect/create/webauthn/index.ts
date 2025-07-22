import { DEFAULT_SESSION_DURATION, now } from "@/const";
import { doLogin, doSignup } from "@/hooks/account";
import { useConnection } from "@/hooks/connection";
import Controller from "@/utils/controller";
import { Owner, Signer } from "@cartridge/controller-wasm";
import { ControllerQuery } from "@cartridge/ui/utils/api/cartridge";
import { useCallback } from "react";
import { BlockTag, RpcError, shortString } from "starknet";
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

      await waitUntilAccountIsDeployed(controller);

      window.controller = controller;
      setController(controller);
    },
    [origin, rpcUrl, chainId, setController],
  );

  const login = useCallback(
    async (
      controller: ControllerQuery["controller"],
      webauthnsSigner: Signer,
      loginMode: LoginMode,
      isSlot: boolean,
    ) => {
      if (!controller) throw new Error("No controller found");

      const initialOwner: Owner = {
        signer: {
          webauthn: {
            rpId: import.meta.env.VITE_RP_ID!,
            credentialId: webauthnsSigner.webauthns?.[0]?.credentialId ?? "",
            publicKey: webauthnsSigner.webauthns?.[0]?.publicKey ?? "",
          },
        },
      };
      const controllerObject = await createController(
        origin!,
        chainId!,
        rpcUrl!,
        controller.accountID,
        controller.constructorCalldata[0],
        controller.address,
        initialOwner,
      );

      if (loginMode === LoginMode.Webauthn) {
        await doLogin({
          name: controller.accountID,
          credentialId: initialOwner.signer?.webauthn?.credentialId ?? "",
          finalize: !!isSlot,
        });
      } else {
        await controllerObject.login(
          now() + DEFAULT_SESSION_DURATION,
          true,
          webauthnsSigner,
        );
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

const waitUntilAccountIsDeployed = async (controller: Controller) => {
  const ownerGuid = controller.ownerGuid();
  const call = {
    contractAddress: controller.address(),
    entrypoint: "is_owner",
    calldata: [ownerGuid],
  };
  const delay = 1_000;
  const timeout = 20_000;

  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const isOwner = await controller.provider.callContract(
        call,
        BlockTag.LATEST,
      );

      if (isOwner) {
        return true;
      }
    } catch (error) {
      if (
        !(
          error instanceof RpcError &&
          error.isType("CONTRACT_ERROR") &&
          error.message.includes("is not deployed")
        )
      ) {
        throw error;
      }
    } finally {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Timeout waiting for account to be deployed");
};
