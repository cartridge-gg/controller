import { STABLE_CONTROLLER } from "@/components/provider/upgrade";
import { DEFAULT_SESSION_DURATION, now } from "@/const";
import { useConnection } from "@/hooks/connection";
import Controller from "@/utils/controller";
import { PopupCenter } from "@/utils/url";
import { Signer } from "@cartridge/account-wasm";
import {
  AccountQuery,
  SignerType,
  useAccountQuery,
} from "@cartridge/utils/api/cartridge";
import { useCallback, useState } from "react";
import { AuthenticationMethod, LoginMode } from "../types";
import { useExternalWalletAuthentication } from "./external-wallet";
import { useSocialAuthentication } from "./social";
import { AuthenticationStep, fetchAccount } from "./utils";
import { useWebauthnAuthentication } from "./webauthn";

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

  const [authenticationStep, setAuthenticationStep] =
    useState<AuthenticationStep>(AuthenticationStep.FillForm);

  const { origin, policies, rpcUrl, chainId, setController } = useConnection();
  const { signup: signupWithWebauthn, login: loginWithWebauthn } =
    useWebauthnAuthentication();
  const { signup: signupWithSocial, login: loginWithSocial } =
    useSocialAuthentication();
  const { signup: signupWithExternalWallet } =
    useExternalWalletAuthentication();

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
    async (username: string, authenticationMode: AuthenticationMethod) => {
      if (!origin || !chainId || !rpcUrl) {
        throw new Error("Origin, chainId, or rpcUrl not found");
      }

      let signupResponse: SignupResponse | undefined;
      switch (authenticationMode) {
        case "webauthn":
          await signupWithWebauthn(username, doPopupFlow);
          return;
        case "social":
          signupResponse = await signupWithSocial(username);
          break;
        case "metamask":
        case "phantom":
        case "argent":
        case "rabby":
          signupResponse = await signupWithExternalWallet(
            username,
            authenticationMode,
          );
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

      await controller.login(now() + DEFAULT_SESSION_DURATION);
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

  const handleLogin = useCallback(
    async (username: string) => {
      const { account } = await fetchAccount(username);
      if (!account) {
        throw new Error("Account not found");
      }

      const { controllers } = account ?? {};
      if (
        controllers?.edges?.[0]?.node?.signers?.[0]?.type ===
        SignerType.Webauthn
      ) {
        await loginWithWebauthn(account, loginMode, !!isSlot);
      } else {
        await loginWithSocial(account);
      }
    },
    [isSlot, loginWithWebauthn, loginWithSocial, loginMode],
  );

  const handleSubmit = useCallback(
    async (
      username: string,
      exists: boolean,
      authenticationMode?: AuthenticationMethod,
    ) => {
      setError(undefined);
      setIsLoading(true);

      try {
        if (exists) {
          await handleLogin(username);
        } else {
          await handleSignup(username, authenticationMode ?? "webauthn");
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
    authenticationStep,
    setAuthenticationStep,
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
