import { STABLE_CONTROLLER } from "@/components/provider/upgrade";
import { DEFAULT_SESSION_DURATION, NOW } from "@/const";
import { doLogin } from "@/hooks/account";
import { useConnection } from "@/hooks/connection";
import Controller from "@/utils/controller";
import { PopupCenter } from "@/utils/url";
import { Signer } from "@cartridge/account-wasm";
import { AccountQuery, useAccountQuery } from "@cartridge/utils/api/cartridge";
import { useCallback, useState } from "react";
import { AuthenticationMode, LoginMode } from "../types";
import { useSignupWithSocial } from "./social/signup";
import { fetchAccount } from "./utils";
import { useSignupWithWebauthn } from "./webauthn/signup";

export interface SignupResponse {
  address: string;
  signer: Signer;
}

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
  const { signupWithWebauthn } = useSignupWithWebauthn();
  const { signupWithSocial } = useSignupWithSocial();

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
    async (username: string, authenticationMode: AuthenticationMode) => {
      if (!origin || !chainId || !rpcUrl) {
        throw new Error("Origin, chainId, or rpcUrl not found");
      }

      let signupResponse: SignupResponse | undefined;
      switch (authenticationMode) {
        case AuthenticationMode.Webauthn:
          await signupWithWebauthn(username, doPopupFlow);
          return;
        case AuthenticationMode.Social:
          signupResponse = await signupWithSocial(username);
          break;
        default:
          break;
      }

      if (!signupResponse) {
        throw new Error("No signature found");
      }

      const controller = new Controller({
        appId: origin,
        classHash: STABLE_CONTROLLER.hash,
        chainId,
        rpcUrl,
        address: signupResponse.address,
        username,
        owner: {
          signer: signupResponse.signer,
        },
      });
      window.controller = controller;
      setController(controller);

      const loginResponse = await controller.login(
        NOW + DEFAULT_SESSION_DURATION,
      );
      if (!loginResponse.isRegistered) {
        throw new Error("Failed to login");
      }
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
      const { account } = await fetchAccount(username);
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
    async (
      username: string,
      exists: boolean,
      authenticationMode?: AuthenticationMode,
    ) => {
      setError(undefined);
      setIsLoading(true);

      try {
        if (exists) {
          await handleLogin(username);
        } else {
          await handleSignup(
            username,
            authenticationMode ?? AuthenticationMode.Webauthn,
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
    [handleLogin, handleSignup, doPopupFlow],
  );

  return {
    isLoading,
    error,
    setError,
    handleSubmit,
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
