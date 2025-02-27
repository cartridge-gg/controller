import { useState, useCallback } from "react";
import { useConnection } from "#hooks/connection";
import { LoginMode } from "../types";
import { doLogin, doSignup } from "#hooks/account";
import { constants, RpcProvider } from "starknet";
import Controller from "#utils/controller";
import { fetchAccount } from "./utils";
import { PopupCenter } from "#utils/url";
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
  const { origin, policies, rpcUrl, setController } = useConnection();

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
          const { username, credentials, controllers } = data.account ?? {};
          const { id: credentialId, publicKey } =
            credentials?.webauthn?.[0] ?? {};

          const controllerNode = controllers?.edges?.[0]?.node;

          if (controllerNode && username && credentialId && publicKey) {
            await initController(
              username,
              controllerNode.constructorCalldata[0],
              controllerNode.address,
              credentialId,
              publicKey,
            );
          }
        } catch (e: unknown) {
          console.error(e);
          setError(e as Error);
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
      if (!origin || !rpcUrl) return;

      const provider = new RpcProvider({ nodeUrl: rpcUrl });
      const chainId = await provider.getChainId();

      const controller = new Controller({
        appId: origin,
        classHash,
        chainId,
        rpcUrl,
        address,
        username,
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
      onCreated?.();
    },
    [origin, rpcUrl, setController, onCreated],
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
          const { account } = await fetchAccount(username);
          const { credentials, controllers } = account ?? {};
          const { id: credentialId, publicKey } =
            credentials?.webauthn?.[0] ?? {};

          const controllerNode = controllers?.edges?.[0]?.node;

          if (!credentialId)
            throw new Error("No credential ID found for this account");

          if (
            loginMode === LoginMode.Webauthn ||
            Object.keys(policies?.contracts ?? {}).length +
              (policies?.messages?.length ?? 0) ===
              0
          ) {
            await doLogin({
              name: username,
              credentialId,
              finalize: !!isSlot,
            });
          }

          if (controllerNode && publicKey) {
            await initController(
              username,
              controllerNode.constructorCalldata[0],
              controllerNode.address,
              credentialId,
              publicKey,
            );
          }
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
            username: finalUsername,
            controllers,
            credentials,
          } = data?.finalizeRegistration ?? {};

          if (!credentials?.webauthn) return;

          const { id: credentialId, publicKey } =
            credentials.webauthn?.[0] ?? {};
          const controllerNode = controllers?.edges?.[0]?.node;

          if (!controllerNode || !finalUsername) return;

          await initController(
            finalUsername,
            controllerNode.constructorCalldata[0],
            controllerNode.address,
            credentialId,
            publicKey,
          );
        }
      } catch (e: unknown) {
        if (
          e instanceof Error &&
          (e.message.includes("Invalid 'sameOriginWithAncestors' value") ||
            e.message.includes("document which is same-origin"))
        ) {
          doPopupFlow(username);
          return;
        }

        console.error(e);
        setError(e as Error);
      }

      setIsLoading(false);
    },
    [loginMode, policies, isSlot, initController, doPopupFlow],
  );

  return {
    isLoading,
    error,
    setError,
    handleSubmit,
  };
}
