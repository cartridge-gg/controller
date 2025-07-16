import { STABLE_CONTROLLER } from "@/components/provider/upgrade";
import { DEFAULT_SESSION_DURATION, now } from "@/constants";
import { useConnection } from "@/hooks/connection";
import { useWallets } from "@/hooks/wallets";
import Controller from "@/utils/controller";
import { PopupCenter } from "@/utils/url";
import { AuthOption } from "@cartridge/controller";
import {
  computeAccountAddress,
  Owner,
  Signer,
} from "@cartridge/controller-wasm";
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

  const signupOptions: AuthOption[] = useMemo(() => {
    return [
      "webauthn" as AuthOption,
      ...wallets
        .filter(
          (wallet) => wallet.type !== "argent" && wallet.type !== "phantom",
        )
        .map((wallet) => wallet.type),
      "discord" as AuthOption,
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
          signer = {
            type: SignerType.Webauthn,
            credential: JSON.stringify({}),
          };
          return;
        case "discord":
          signupResponse = (await signupWithSocial(username)) as SignupResponse;
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

      const result = await controller.login(
        now() + DEFAULT_SESSION_DURATION,
        false,
      );

      const registerRet = await controller.register({
        username,
        chainId: shortString.decodeShortString(chainId),
        owner: signer,
        session: {
          expiresAt: result.session.expiresAt,
          guardianKeyGuid: result.session.guardianKeyGuid,
          metadataHash: result.session.metadataHash,
          sessionKeyGuid: result.session.sessionKeyGuid,
          allowedPoliciesRoot: result.allowedPoliciesRoot,
          authorization: result.authorization ?? [],
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
      createController,
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

      const controller = controllerRet.controller;

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
              webauthns: webauthnSigners.map((signer) => {
                const webauthn = signer.metadata as WebauthnCredentials;
                return {
                  rpId: import.meta.env.VITE_RP_ID!,
                  credentialId: webauthn.webauthn?.[0]?.id ?? "",
                  publicKey: webauthn.webauthn?.[0]?.publicKey ?? "",
                };
              }),
            },
            loginMode,
            !!isSlot,
          );
          return;
        }
        case "discord": {
          setWaitingForConfirmation(true);
          loginResponse = await loginWithSocial();
          break;
        }
        case "rabby":
        case "metamask": {
          setWaitingForConfirmation(true);
          loginResponse = await loginWithExternalWallet(
            controller,
            authenticationMethod,
          );
          break;
        }
        case "walletconnect":
          setWaitingForConfirmation(true);
          loginResponse = await loginWithWalletConnect(controller);
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

      const controllerObject = await createController(
        origin,
        chainId,
        rpcUrl,
        username,
        controller.constructorCalldata[0],
        controller.address,
        {
          signer: loginResponse?.signer,
        },
      );

      await controllerObject.login(now() + DEFAULT_SESSION_DURATION, true);

      window.controller = controllerObject;
      setController(controllerObject);
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
