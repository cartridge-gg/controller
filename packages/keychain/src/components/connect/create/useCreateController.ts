import { DEFAULT_SESSION_DURATION, NOW } from "@/const";
import { doLogin, doSignup } from "@/hooks/account";
import { useConnection } from "@/hooks/connection";
import Controller from "@/utils/controller";
import { PopupCenter } from "@/utils/url";
import { AccountQuery, useAccountQuery } from "@cartridge/utils/api/cartridge";
import { useCallback, useState } from "react";
import { constants } from "starknet";
import { LoginMode, SignupMode } from "../types";
import { useSignupWithSocial } from "./social/signup";
import { fetchAccount } from "./utils";
import { useSignupWithWebauthn } from "./webauthn/signup";

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
  const { origin, policies, rpcUrl, chainId, setController } = useConnection();
  const signupWithWebauthn = useSignupWithWebauthn();
  const { handleSignupWithSocial } = useSignupWithSocial();

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

  const handleSignup = useCallback(
    async (username: string, signupMethod: SignupMode) => {
      setError(undefined);
      setIsLoading(true);

      try {
        switch (signupMethod) {
          case SignupMode.Webauthn:
            await signupWithWebauthn(username, doPopupFlow);
            break;
          case SignupMode.Social:
            await handleSignupWithSocial(username);
            break;
          default:
            break;
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

  const handleLogin = useCallback(
    async (username: string) => {
      setError(undefined);
      setIsLoading(true);
      try {
        const { account } = await fetchAccount(username);
        const { credentials, controllers } = account ?? {};
        const { id: credentialId, publicKey } =
          credentials?.webauthn?.[0] ?? {};

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
          username,
          controllerNode.constructorCalldata[0],
          controllerNode.address,
          credentialId,
          publicKey,
        );

        if (loginMode === LoginMode.Webauthn) {
          await doLogin({
            name: username,
            credentialId,
            finalize: !!isSlot,
          });
        } else {
          await controller.login(NOW + DEFAULT_SESSION_DURATION);
        }

        window.controller = controller;
        setController(controller);
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

          if (!controllerNode || !publicKey) {
            return;
          }

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

          if (loginMode === LoginMode.Webauthn) {
            await doLogin({
              name: username,
              credentialId,
              finalize: !!isSlot,
            });
          } else {
            await controller.login(NOW + DEFAULT_SESSION_DURATION);
          }

          window.controller = controller;
          setController(controller);
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
    handleLogin,
    handleSignup,
  };
}

export async function createController(
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
