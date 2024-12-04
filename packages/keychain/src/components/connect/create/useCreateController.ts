import { useState, useCallback } from "react";
import { useConnection } from "hooks/connection";
import { LoginMode } from "../types";
import { doLogin, doSignup } from "hooks/account";
import { constants } from "starknet";
import Controller from "utils/controller";
import { fetchAccount } from ".";
import { PopupCenter } from "utils/url";
import { useAccountQuery } from "@cartridge/utils/api/cartridge";

export function useCreateController({
  onCreated,
  isSlot,
  loginMode = LoginMode.Webauthn,
}: {
  onCreated?: () => void;
  isSlot?: boolean;
  loginMode?: LoginMode;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const [pendingUsername, setPendingUsername] = useState<string>();
  const { origin, policies, chainId, rpcUrl, setController } = useConnection();

  useAccountQuery(
    { username: pendingUsername || "" },
    {
      enabled: !!pendingUsername,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
      staleTime: 10000000,
      cacheTime: 10000000,
      refetchInterval: (data) => (!data ? 1000 : false),
      onSuccess: async (data) => {
        try {
          const {
            account: {
              username,
              credentials: {
                webauthn: [{ id: credentialId, publicKey }],
              },
              controllers,
            },
          } = data;

          const controllerNode = controllers.edges?.[0].node;

          if (controllerNode) {
            await initController(
              username,
              controllerNode.constructorCalldata[0],
              controllerNode.address,
              credentialId,
              publicKey,
            );
          }
        } catch (e) {
          setError(e);
        }
      },
    },
  );

  const initController = useCallback(
    async (
      username: string,
      classHash: string,
      address: string,
      credentialId: string,
      publicKey: string,
    ) => {
      const controller = new Controller({
        appId: origin,
        classHash,
        chainId,
        rpcUrl,
        address,
        username,
        publicKey,
        credentialId,
      });

      window.controller = controller;
      setController(controller);
      onCreated?.();
    },
    [origin, chainId, rpcUrl, setController, onCreated],
  );

  const doPopupFlow = useCallback(
    (username: string) => {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("name", encodeURIComponent(username));
      searchParams.set("action", "signup");
      setPendingUsername(username);

      PopupCenter(
        `/authenticate?${searchParams.toString()}`,
        "Cartridge Signup",
        480,
        640,
      );
    },
    [setPendingUsername],
  );

  const handleSubmit = useCallback(
    async (username: string, exists: boolean) => {
      setError(undefined);
      setIsLoading(true);

      try {
        if (exists) {
          // Login flow
          const {
            account: {
              credentials: {
                webauthn: [{ id: credentialId, publicKey }],
              },
              controllers,
            },
          } = await fetchAccount(username);

          const controllerNode = controllers.edges?.[0].node;

          if (loginMode === LoginMode.Webauthn || policies?.length === 0) {
            await doLogin({
              name: username,
              credentialId,
              finalize: isSlot,
            });
          }

          await initController(
            username,
            controllerNode.constructorCalldata[0],
            controllerNode.address,
            credentialId,
            publicKey,
          );
        } else {
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
            finalizeRegistration: {
              username: finalUsername,
              controllers,
              credentials: { webauthn },
            },
          } = data;

          const { id: credentialId, publicKey } = webauthn[0];
          const controllerNode = controllers.edges?.[0].node;

          await initController(
            finalUsername,
            controllerNode.constructorCalldata[0],
            controllerNode.address,
            credentialId,
            publicKey,
          );
        }
      } catch (e) {
        if (
          // Bitwarden extension
          e.message.includes("Invalid 'sameOriginWithAncestors' value") ||
          // Other password manager
          e.message.includes("document which is same-origin")
        ) {
          doPopupFlow(username);
          return;
        }

        setError(e as Error);
      }

      setIsLoading(false);
    },
    [loginMode, policies, isSlot, initController],
  );

  return {
    isLoading,
    error,
    setError,
    handleSubmit,
  };
}
