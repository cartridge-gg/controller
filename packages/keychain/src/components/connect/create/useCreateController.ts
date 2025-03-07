import { useState, useCallback, useEffect } from "react";
import { useConnection } from "@/hooks/connection";
import { LoginMode } from "../types";
import { doLogin, doSignup } from "@/hooks/account";
import { constants, RpcProvider } from "starknet";
import Controller from "@/utils/controller";
import { fetchAccount } from "./utils";
import { PopupCenter } from "@/utils/url";
import { useAccountQuery, AccountQuery } from "@cartridge/utils/api/cartridge";
import { DEFAULT_SESSION_DURATION, NOW } from "@/const";

export function useCreateController({
  isSlot,
  loginMode = LoginMode.Webauthn,
}: {
  isSlot?: boolean;
  loginMode?: LoginMode;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const [pendingUsername, setPendingUsername] = useState<string>();
  const { origin, policies, rpcUrl, setController } = useConnection();

  const [chainId, setChainId] = useState<string>();

  useEffect(() => {
    const fetchChainId = async () => {
      try {
        const provider = new RpcProvider({ nodeUrl: rpcUrl });
        const id = await provider.getChainId();
        setChainId(id);
      } catch (e) {
        console.error("Failed to fetch chain ID:", e);
      }
    };

    if (rpcUrl) {
      fetchChainId();
    }
  }, [rpcUrl]);

  const handleAccountQuerySuccess = useCallback(
    async (data: AccountQuery) => {
      try {
        const { username, credentials, controllers } = data.account ?? {};
        const { id: credentialId, publicKey } =
          credentials?.webauthn?.[0] ?? {};

        const controllerNode = controllers?.edges?.[0]?.node;

        if (
          controllerNode &&
          username &&
          credentialId &&
          publicKey &&
          rpcUrl &&
          chainId &&
          origin
        ) {
          const controller = await createController(
            origin,
            chainId,
            rpcUrl,
            username,
            controllerNode.constructorCalldata[0],
            controllerNode.address,
            credentialId,
            publicKey,
          );

          window.controller = controller;
          setController(controller);
        }
      } catch (e: unknown) {
        console.error(e);
        setError(e as Error);
      }
    },
    [chainId, origin, rpcUrl, setController],
  );

  useAccountQuery(
    { username: pendingUsername || "" },
    {
      enabled: !!pendingUsername,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
      staleTime: 10000000,
      cacheTime: 10000000,
      refetchInterval: (data) => (!data ? 1000 : false),
      onSuccess: handleAccountQuerySuccess,
    },
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
            const controller = await createController(
              origin!,
              chainId!,
              rpcUrl!,
              username,
              controllerNode.constructorCalldata[0],
              controllerNode.address,
              credentialId,
              publicKey,
            );

            await controller.login(NOW + DEFAULT_SESSION_DURATION);

            window.controller = controller;
            setController(controller);
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

          if (
            !controllerNode ||
            !finalUsername ||
            !chainId ||
            !rpcUrl ||
            !origin
          )
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
    [
      chainId,
      rpcUrl,
      origin,
      loginMode,
      policies,
      isSlot,
      createController,
      doPopupFlow,
    ],
  );

  return {
    isLoading,
    error,
    setError,
    handleSubmit,
  };
}

async function createController(
  origin: string,
  chainId: string,
  rpcUrl: string,
  username: string,
  classHash: string,
  address: string,
  credentialId: string,
  publicKey: string,
) {
  return new Controller({
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
}
