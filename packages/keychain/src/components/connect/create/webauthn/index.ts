import { DEFAULT_SESSION_DURATION, now } from "@/constants";
import { doSignup } from "@/hooks/account";
import { useConnection } from "@/hooks/connection";
import Controller from "@/utils/controller";
import { openPopupAuth, preOpenPopupWindow } from "@/utils/connection/popup";
import { setBearerToken } from "@/utils/bearer-token";
import { requestStorageAccess } from "@/utils/connection/storage-access";
import { Owner } from "@cartridge/controller-wasm";
import { ControllerQuery } from "@cartridge/controller-ui/utils/api/cartridge";
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

      if (webauthnPopup.create) {
        const { state, sessionToken } = await openPopupAuth({
          action: "signup",
          username,
          preset: preset ?? undefined,
          rpcUrl: rpcUrl ?? undefined,
          policies: policiesStr ?? undefined,
          origin: origin ?? undefined,
        });

        if (sessionToken) {
          setBearerToken(sessionToken);
        }

        const controller = await Controller.importState(state);

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

  // Popup-only login path. Skips the iframe-side controller lookup so
  // window.open() fires synchronously from the user gesture — Safari
  // otherwise blocks the popup because the gesture has expired by the
  // time fetchController's await resolves. The popup handles its own
  // controller bootstrap from the username.
  const loginViaPopup = useCallback(
    async (username: string) => {
      // iOS Safari partitions iframe localStorage strictly by parent site,
      // so a bearer token written after the popup returns can land in a
      // partition the fetcher can't see — leaving the user stuck on
      // "Sign in required". requestStorageAccess() lifts the partition,
      // but it shows a native permission prompt that the popup window
      // will steal focus from and dismiss if both fire from the same
      // click.
      //
      // Order: (1) synchronously pre-open the popup at about:blank to
      // consume the user gesture for window.open, (2) await the storage
      // access prompt while the popup sits empty in the background, (3)
      // navigate the already-open popup to the auth URL. Now the prompt
      // has uninterrupted time to be answered.
      const popup = preOpenPopupWindow();
      await requestStorageAccess().catch(() => false);

      const { state, sessionToken } = await openPopupAuth(
        {
          action: "login",
          username,
          preset: preset ?? undefined,
          rpcUrl: rpcUrl ?? undefined,
          policies: policiesStr ?? undefined,
          origin: origin ?? undefined,
        },
        popup,
      );

      if (sessionToken) {
        setBearerToken(sessionToken);
      }

      const controller = await Controller.importState(state);

      window.controller = controller;
      setController(controller);
      return { controller, completedInPopup: true } as WebauthnAuthResult;
    },
    [origin, rpcUrl, setController, preset, policiesStr],
  );

  const login = useCallback(
    async (
      controllerQuery: ControllerQuery["controller"],
      webauthnsSigner: Owner,
      isSlot: boolean,
    ) => {
      if (!controllerQuery) throw new Error("No controller found");
      if (!chainId) throw new Error("No chainId found");

      if (webauthnPopup.get) {
        return loginViaPopup(controllerQuery.accountID);
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
    [chainId, rpcUrl, origin, setController, webauthnPopup, loginViaPopup],
  );

  return {
    signup,
    login,
    loginViaPopup,
  };
}
