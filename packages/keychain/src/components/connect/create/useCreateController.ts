import { STABLE_CONTROLLER } from "@/components/provider/upgrade";
import { DEFAULT_SESSION_DURATION, now } from "@/const";
import { useConnection } from "@/hooks/connection";
import Controller from "@/utils/controller";
import { PopupCenter } from "@/utils/url";
import { computeAccountAddress, Owner, Signer } from "@cartridge/account-wasm";
import {
  AccountQuery,
  SignerInput,
  SignerType,
  useAccountQuery,
  useRegisterMutation,
} from "@cartridge/utils/api/cartridge";
import { useCallback, useState } from "react";
import { shortString } from "starknet";
import { AuthenticationMethod, LoginMode } from "../types";
import { useExternalWalletAuthentication } from "./external-wallet";
import { useSocialAuthentication } from "./social";
import { AuthenticationStep, fetchController } from "./utils";
import { useWalletConnectAuthentication } from "./wallet-connect";
import { useWebauthnAuthentication } from "./webauthn";

export interface SignupResponse {
  address: string;
  signer: Signer;
  type: AuthenticationMethod;
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
  const [overlay, setOverlay] = useState<React.ReactNode | null>(null);

  const [authenticationStep, setAuthenticationStep] = useState<
    AuthenticationStep | undefined
  >(AuthenticationStep.FillForm);

  const { origin, policies, rpcUrl, chainId, setController } = useConnection();
  const { mutateAsync: register } = useRegisterMutation();
  const { signup: signupWithWebauthn, login: loginWithWebauthn } =
    useWebauthnAuthentication();
  const { signup: signupWithSocial, login: loginWithSocial } =
    useSocialAuthentication();
  const { signup: signupWithExternalWallet } =
    useExternalWalletAuthentication();
  const { signup: signupWithWalletConnect } =
    useWalletConnectAuthentication(setOverlay);

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
      let signer: SignerInput | undefined;
      switch (authenticationMode) {
        case "webauthn":
          await signupWithWebauthn(username, doPopupFlow);
          signer = {
            type: SignerType.Webauthn,
            credential: JSON.stringify({}),
          };
          return;
        case "social":
          signupResponse = await signupWithSocial(username);
          signer = {
            type: SignerType.Eip191,
            credential: JSON.stringify({
              provider: "discord",
              eth_address: signupResponse.address,
            }),
          };
          break;
        case "walletconnect":
          signupResponse = await signupWithWalletConnect();
          signer = {
            type: SignerType.Eip191,
            credential: JSON.stringify({
              provider: authenticationMode,
              eth_address: signupResponse.address,
            }),
          };
          break;
        case "metamask":
        case "phantom":
        case "argent":
        case "rabby":
          signupResponse = await signupWithExternalWallet(authenticationMode);
          signer = {
            type: SignerType.Eip191,
            credential: JSON.stringify({
              provider: authenticationMode,
              eth_address: signupResponse.address,
            }),
          };
          break;
        default:
          break;
      }

      if (!signupResponse || !signer) {
        throw new Error("Signup failed");
      }

      const classHash = STABLE_CONTROLLER.hash;
      const owner = {
        signer: signupResponse.signer,
      };
      const salt = shortString.encodeShortString(username);
      const address = computeAccountAddress(classHash, owner, salt);

      const controller = new Controller({
        appId: origin,
        classHash,
        chainId,
        rpcUrl,
        address,
        username,
        owner,
      });

      const result = await controller.login(now() + DEFAULT_SESSION_DURATION);

      const registerRet = await register({
        username,
        chainId,
        owner: signer,
        session: {
          expiresAt: result.session.expiresAt.toString(),
          guardianKeyGuid: result.session.guardianKeyGuid,
          metadataHash: result.session.metadataHash,
          sessionKeyGuid: result.session.sessionKeyGuid,
          allowedPoliciesRoot: result.allowedPoliciesRoot,
          authorization: result.authorization ?? [],
        },
      });
      console.log("registerRet", registerRet);

      if (registerRet.register.name) {
        window.controller = controller;
        setController(controller);
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
      signupWithExternalWallet,
      signupWithSocial,
      signupWithWebauthn,
      signupWithWalletConnect,
    ],
  );

  const handleLogin = useCallback(
    async (username: string) => {
      if (!chainId) {
        throw new Error("No chainId");
      }

      const controllerRet = await fetchController(chainId, username);
      if (!controllerRet) {
        throw new Error("Undefined controller");
      }

      const controller = controllerRet.controller;

      const signer = controller?.signers?.[0];

      if (!signer || !signer.metadata) {
        // Handle the case where the signer or metadata is missing
        // This might involve throwing an error or logging a warning
        console.error(
          "Signer or signer metadata not found for controller:",
          controller,
        );
        // Depending on expected behavior, you might want to throw an error:
        // throw new Error("Signer information is missing.");
        return; // Or handle appropriately
      }

      switch (signer.metadata.__typename) {
        case "WebauthnCredentials": {
          const webauthnCredential = signer.metadata.webauthn?.[0];
          if (!webauthnCredential) {
            throw new Error("WebAuthn credential not found for signer.");
          }

          await loginWithWebauthn(
            controller,
            webauthnCredential,
            loginMode,
            !!isSlot,
          );
          break;
        }
        case "Eip191Credentials": {
          const eip191Credential = signer.metadata.eip191?.[0];
          if (!eip191Credential) {
            throw new Error("EIP191 credential not found for signer.");
          }

          await loginWithSocial(controller, eip191Credential);
          break;
        }
        case "SIWSCredentials": // Assuming SIWS also uses social login flow
        case "StarknetCredentials": // Assuming Starknet also uses social login flow for now, adjust if needed
          throw new Error("Login method not supported yet.");
        default:
          throw new Error("Unknown login method");
      }
    },
    [isSlot, loginWithWebauthn, loginWithSocial, loginMode, chainId],
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
    overlay,
    setOverlay,
  };
}

export async function createController(
  origin: string,
  chainId: string,
  rpcUrl: string,
  username: string,
  classHash: string,
  address: string,
  owner: Owner,
) {
  return new Controller({
    appId: origin,
    classHash,
    chainId,
    rpcUrl,
    address,
    username,
    owner,
  });
}
