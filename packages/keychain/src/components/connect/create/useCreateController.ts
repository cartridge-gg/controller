import { STABLE_CONTROLLER } from "@/components/provider/upgrade";
import { DEFAULT_SESSION_DURATION, now } from "@/constants";
import { useConnection } from "@/hooks/connection";
import { useWallets } from "@/hooks/wallets";
import Controller from "@/utils/controller";
import { processControllerQuery } from "@/utils/signers";
import { PopupCenter } from "@/utils/url";
import { AuthOption } from "@cartridge/controller";
import { computeAccountAddress, Signer } from "@cartridge/controller-wasm";
import {
  AccountQuery,
  CredentialMetadata,
  SignerInput,
  SignerType,
  useAccountQuery,
  WebauthnCredentials,
} from "@cartridge/ui/utils/api/cartridge";
import { useCallback, useMemo, useState } from "react";
import { shortString } from "starknet";
import {
  credentialToAddress,
  credentialToAuth,
  LoginMode,
  signerToAddress,
} from "../types";
import { useExternalWalletAuthentication } from "./external-wallet";
import { useSocialAuthentication } from "./social";
import { AuthenticationStep, fetchController } from "./utils";
import { useWalletConnectAuthentication } from "./wallet-connect";
import { useWebauthnAuthentication } from "./webauthn";

export interface SignupResponse {
  address: string;
  signer: Signer;
  type: AuthOption;
}

export interface LoginResponse {
  signer: Signer;
}

export function useCreateController({
  isSlot,
  loginMode = LoginMode.Webauthn,
}: {
  isSlot?: boolean;
  loginMode?: LoginMode;
}) {
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const [pendingUsername, setPendingUsername] = useState<string>();
  const [overlay, setOverlay] = useState<React.ReactNode | null>(null);
  const [changeWallet, setChangeWallet] = useState<boolean>(false);

  const [authMethod, setAuthMethod] = useState<AuthOption | undefined>(
    undefined,
  );
  const [authenticationStep, setAuthenticationStep] =
    useState<AuthenticationStep>(AuthenticationStep.FillForm);

  const {
    origin,
    policies,
    rpcUrl,
    chainId,
    setController,
    configSignupOptions,
  } = useConnection();
  const { signup: signupWithWebauthn, login: loginWithWebauthn } =
    useWebauthnAuthentication();
  const { signup: signupWithSocial, login: loginWithSocial } =
    useSocialAuthentication(setChangeWallet);
  const { signup: signupWithExternalWallet, login: loginWithExternalWallet } =
    useExternalWalletAuthentication();
  const { signup: signupWithWalletConnect, login: loginWithWalletConnect } =
    useWalletConnectAuthentication();
  const { wallets } = useWallets();

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
          const controller = await Controller.create({
            appId: origin,
            chainId,
            rpcUrl,
            username,
            classHash: controllerNode.constructorCalldata[0],
            address: controllerNode.address,
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

  const signupOptions: AuthOption[] = useMemo(() => {
    return [
      "webauthn" as AuthOption,
      ...wallets
        .filter(
          (wallet) => wallet.type !== "argent" && wallet.type !== "phantom",
        )
        .map((wallet) => wallet.type),
      "discord" as AuthOption,
      "google" as AuthOption,
      "walletconnect" as AuthOption,
    ].filter(
      (option) => !configSignupOptions || configSignupOptions.includes(option),
    );
  }, [wallets, configSignupOptions]);

  const handleSignup = useCallback(
    async (username: string, authenticationMode: AuthOption) => {
      if (!origin || !chainId || !rpcUrl) {
        throw new Error("Origin, chainId, or rpcUrl not found");
      }

      let signupResponse: SignupResponse | undefined;
      let signer: SignerInput | undefined;
      switch (authenticationMode) {
        case "webauthn":
          await signupWithWebauthn(username, doPopupFlow);
          return;
        case "discord":
          signupResponse = (await signupWithSocial(
            "discord",
            username,
          )) as SignupResponse;
          signer = {
            type: SignerType.Eip191,
            credential: JSON.stringify({
              provider: "discord",
              eth_address: signupResponse.address,
            }),
          };
          break;
        case "google":
          signupResponse = (await signupWithSocial(
            "google",
            username,
          )) as SignupResponse;
          signer = {
            type: SignerType.Eip191,
            credential: JSON.stringify({
              provider: "google",
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

      const { controller, session } = await Controller.login({
        appId: origin,
        classHash,
        rpcUrl,
        chainId,
        address,
        username,
        owner,
        cartridgeApiUrl: import.meta.env.VITE_CARTRIDGE_API_URL,
        session_expires_at_s: Number(now() + DEFAULT_SESSION_DURATION),
        isControllerRegistered: false,
      });

      const registerRet = await controller.register({
        username,
        chainId: shortString.decodeShortString(chainId),
        owner: signer,
        session: {
          expiresAt: session.expiresAt,
          guardianKeyGuid: session.guardianKeyGuid,
          metadataHash: session.metadataHash,
          sessionKeyGuid: session.sessionKeyGuid,
          allowedPoliciesRoot: session.allowedPoliciesRoot,
          authorization: session.authorization ?? [],
          appId: origin,
        },
      });

      if (registerRet.register.username) {
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
      setController,
      doPopupFlow,
      signupWithExternalWallet,
      signupWithSocial,
      signupWithWebauthn,
      signupWithWalletConnect,
    ],
  );

  const handleLogin = useCallback(
    async (username: string, authenticationMethod: AuthOption) => {
      if (!chainId) {
        throw new Error("No chainId");
      }

      const controllerRet = await fetchController(chainId, username);
      if (!controllerRet) {
        throw new Error("Undefined controller");
      }

      const controller = processControllerQuery(
        controllerRet,
        chainId,
      ).controller;

      if (!controller) {
        throw new Error("Undefined controller");
      }

      let loginResponse: LoginResponse | undefined;
      switch (authenticationMethod) {
        case "webauthn": {
          const webauthnSigners = controller.signers?.filter(
            (signer) => signer.metadata.__typename === "WebauthnCredentials",
          );
          if (!webauthnSigners || webauthnSigners.length === 0) {
            throw new Error("Signer not found for controller");
          }
          await loginWithWebauthn(
            controller,
            {
              signer: {
                webauthns: webauthnSigners.map((signer) => {
                  const webauthn = signer.metadata as WebauthnCredentials;
                  return {
                    rpId: import.meta.env.VITE_RP_ID!,
                    credentialId: webauthn.webauthn?.[0]?.id ?? "",
                    publicKey: webauthn.webauthn?.[0]?.publicKey ?? "",
                  };
                }),
              },
            },
            loginMode,
            !!isSlot,
          );
          return;
        }
        case "discord": {
          setWaitingForConfirmation(true);
          loginResponse = await loginWithSocial("discord");
          break;
        }
        case "google": {
          setWaitingForConfirmation(true);
          loginResponse = await loginWithSocial("google");
          break;
        }
        case "rabby":
        case "metamask": {
          setWaitingForConfirmation(true);
          loginResponse = await loginWithExternalWallet(authenticationMethod);
          break;
        }
        case "walletconnect":
          setWaitingForConfirmation(true);
          loginResponse = await loginWithWalletConnect();
          break;
        case "phantom":
        case "argent":
        default:
          throw new Error("Unknown login method");
      }

      if (!loginResponse) {
        throw new Error("Login failed");
      }

      const connectedAddress = signerToAddress(loginResponse.signer);
      const possibleSigners = controller.signers?.filter(
        (signer) =>
          credentialToAuth(signer.metadata as CredentialMetadata) ===
          authenticationMethod,
      );
      if (!possibleSigners || possibleSigners.length === 0) {
        throw new Error("No signers found for controller");
      }

      if (
        !possibleSigners.find(
          (signer) =>
            credentialToAddress(signer.metadata as CredentialMetadata) ===
            connectedAddress,
        )
      ) {
        setChangeWallet(true);
        return;
      }

      const controllerObject = await Controller.login({
        appId: origin,
        chainId,
        rpcUrl,
        username: controller.accountID,
        classHash: controller.constructorCalldata[0],
        address: controller.address,
        owner: {
          signer: loginResponse?.signer,
        },
        cartridgeApiUrl: import.meta.env.VITE_CARTRIDGE_API_URL,
        session_expires_at_s: Number(now() + DEFAULT_SESSION_DURATION),
        isControllerRegistered: true,
      });

      window.controller = controllerObject.controller;
      setController(controllerObject.controller);
    },
    [
      isSlot,
      loginWithWebauthn,
      loginWithSocial,
      loginWithWalletConnect,
      loginWithExternalWallet,
      loginMode,
      chainId,
      setWaitingForConfirmation,
      setController,
      changeWallet,
      setChangeWallet,
      wallets,
    ],
  );

  const handleSubmit = useCallback(
    async (
      username: string,
      exists: boolean,
      authenticationMethod?: AuthOption,
    ) => {
      setError(undefined);
      setIsLoading(true);

      setAuthMethod(authenticationMethod);

      try {
        if (exists) {
          await handleLogin(username, authenticationMethod ?? "webauthn");
        } else {
          await handleSignup(username, authenticationMethod ?? "webauthn");
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
      } finally {
        if (exists) {
          setWaitingForConfirmation(false);
        }
      }
      setIsLoading(false);
    },
    [handleLogin, handleSignup, doPopupFlow, setAuthMethod],
  );

  return {
    isLoading,
    waitingForConfirmation,
    setWaitingForConfirmation,
    authenticationStep,
    setAuthenticationStep,
    error,
    setError,
    handleSubmit,
    overlay,
    setOverlay,
    changeWallet,
    setChangeWallet,
    signupOptions,
    authMethod,
  };
}
