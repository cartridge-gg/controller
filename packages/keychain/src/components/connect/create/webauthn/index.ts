import { DEFAULT_SESSION_DURATION, now } from "@/constants";
import { doSignup } from "@/hooks/account";
import { useConnection } from "@/hooks/connection";
import Controller from "@/utils/controller";
import { openPopupAuth } from "@/utils/connection/popup";
import { requestStorageAccess } from "@/utils/connection/storage-access";
import { Owner } from "@cartridge/controller-wasm";
import { ControllerQuery } from "@cartridge/ui/utils/api/cartridge";
import { useCallback } from "react";
import { shortString } from "starknet";

type WebauthnAuthResult = {
  controller: Controller;
  completedInPopup: boolean;
};

export function useWebauthnAuthentication() {
  const {
    origin,
    rpcUrl,
    chainId,
    setController,
    webauthnPopup,
    preset,
    policiesStr,
  } = useConnection();

  const signup = useCallback(
    async (username: string) => {
      if (!chainId) throw new Error("No chainId found");

      // Request storage access before controller creation so writes
      // and future clear() calls use the same storage partition.
      try {
        await requestStorageAccess();
      } catch {
        // Non-fatal
      }

      if (webauthnPopup.create) {
        const popupState = await openPopupAuth({
          action: "signup",
          username,
          preset: preset ?? undefined,
          rpcUrl: rpcUrl ?? undefined,
          policies: policiesStr ?? undefined,
          origin: origin ?? undefined,
        });

        const controller = await Controller.importState(popupState);

        window.controller = controller;
        setController(controller);
        return { controller, completedInPopup: true } as WebauthnAuthResult;
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
      return { controller, completedInPopup: false } as WebauthnAuthResult;
    },
    [
      origin,
      rpcUrl,
      chainId,
      setController,
      webauthnPopup,
      preset,
      policiesStr,
    ],
  );

  const login = useCallback(
    async (
      controllerQuery: ControllerQuery["controller"],
      webauthnsSigner: Owner,
      isSlot: boolean,
    ) => {
      if (!controllerQuery) throw new Error("No controller found");
      if (!chainId) throw new Error("No chainId found");

      // Request storage access before controller creation so writes
      // and future clear() calls use the same storage partition.
      try {
        await requestStorageAccess();
      } catch {
        // Non-fatal
      }

      if (webauthnPopup.get) {
        const popupState = await openPopupAuth({
          action: "login",
          username: controllerQuery.accountID,
          preset: preset ?? undefined,
          rpcUrl: rpcUrl ?? undefined,
          policies: policiesStr ?? undefined,
          origin: origin ?? undefined,
        });

        const controller = await Controller.importState(popupState);

        window.controller = controller;
        setController(controller);
        return { controller, completedInPopup: true } as WebauthnAuthResult;
      }

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
      return { controller, completedInPopup: false } as WebauthnAuthResult;
    },
    [
      chainId,
      rpcUrl,
      origin,
      setController,
      webauthnPopup,
      preset,
      policiesStr,
    ],
  );

  return {
    signup,
    login,
  };
}
