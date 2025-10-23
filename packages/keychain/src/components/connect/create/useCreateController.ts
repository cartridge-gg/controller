import { STABLE_CONTROLLER } from "@/components/provider/upgrade";
import { DEFAULT_SESSION_DURATION, now } from "@/constants";
import { useConnection } from "@/hooks/connection";
import { useWallets } from "@/hooks/wallets";
import Controller from "@/utils/controller";
import { PopupCenter } from "@/utils/url";
import { TurnkeyWallet } from "@/wallets/social/turnkey";
import {
  AuthOption,
  AuthOptions,
  EMBEDDED_WALLETS,
  WalletAdapter,
} from "@cartridge/controller";
import { computeAccountAddress, Signer } from "@cartridge/controller-wasm";
import {
  AccountQuery,
  ControllerQuery,
  CredentialMetadata,
  SignerInput,
  SignerType,
  useAccountQuery,
  WebauthnCredentials,
} from "@cartridge/ui/utils/api/cartridge";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { constants, shortString } from "starknet";
import {
  credentialToAddress,
  credentialToAuth,
  signerToAddress,
} from "../types";
import { useExternalWalletAuthentication } from "./external-wallet";
import { usePasswordAuthentication } from "./password";
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
  signers,
}: {
  isSlot?: boolean;
  signers?: AuthOptions;
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
  const [, setSearchParams] = useSearchParams();
  const { origin, rpcUrl, chainId, setController } = useConnection();
  const { signup: signupWithWebauthn, login: loginWithWebauthn } =
    useWebauthnAuthentication();
  const { signup: signupWithSocial, login: loginWithSocial } =
    useSocialAuthentication(setChangeWallet);
  const { signup: signupWithExternalWallet, login: loginWithExternalWallet } =
    useExternalWalletAuthentication();
  const { signup: signupWithWalletConnect, login: loginWithWalletConnect } =
    useWalletConnectAuthentication();
  const passwordAuth = usePasswordAuthentication();
  const { supportedWalletsForAuth } = useWallets();

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

  useEffect(() => {
    if (error) {
      setAuthenticationStep(AuthenticationStep.FillForm);
    }
  }, [error]);

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

  const signupOptions: AuthOptions = useMemo(() => {
    return [...EMBEDDED_WALLETS, ...supportedWalletsForAuth].filter(
      (option) => !signers || signers.includes(option),
    );
  }, [supportedWalletsForAuth, signers]);

  const finishSignup = useCallback(
    async ({
      username,
      chainId,
      rpcUrl,
      signupResponse,
      signer,
    }: {
      username: string;
      chainId: string;
      rpcUrl: string;
      signupResponse: SignupResponse;
      signer: SignerInput;
    }) => {
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
    [setController, origin],
  );

  const handleSignup = useCallback(
    async (
      username: string,
      authenticationMode: AuthOption,
      password?: string,
    ) => {
      if (!origin || !chainId || !rpcUrl) {
        throw new Error("Origin, chainId, or rpcUrl not found");
      }

      let signupResponse: SignupResponse | undefined;
      let signer: SignerInput | undefined;
      switch (authenticationMode) {
        case "webauthn":
          await signupWithWebauthn(username, doPopupFlow);
          return;
        case "google":
        case "discord":
          signupResponse = await signupWithSocial(authenticationMode, username);
          if (!signupResponse) {
            return;
          }
          signer = {
            type: SignerType.Eip191,
            credential: JSON.stringify({
              provider: authenticationMode,
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
        case "password": {
          if (!password) {
            throw new Error("Password required for password authentication");
          }
          signupResponse = await passwordAuth.signup(password);
          // Cast to get the extended password response with encryption data
          const passwordSignup = signupResponse as {
            signer: Signer;
            address: string;
            type: string;
            encryptedPrivateKey: string;
            publicKey: string;
          };
          // Use "password" as the type string with Password-specific credentials
          // Send encrypted_private_key as base64 string directly
          signer = {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            type: "password" as any,
            credential: JSON.stringify({
              public_key: passwordSignup.publicKey,
              encrypted_private_key: passwordSignup.encryptedPrivateKey,
            }),
          };
          break;
        }
        default:
          break;
      }

      if (!signupResponse || !signer) {
        throw new Error("Signup failed");
      }

      await finishSignup({ username, chainId, rpcUrl, signupResponse, signer });
    },
    [
      chainId,
      rpcUrl,
      origin,
      doPopupFlow,
      signupWithExternalWallet,
      signupWithSocial,
      signupWithWebauthn,
      signupWithWalletConnect,
      passwordAuth,
      finishSignup,
    ],
  );

  const finishLogin = useCallback(
    async ({
      controller,
      rpcUrl,
      loginResponse,
      authenticationMethod,
    }: {
      controller: NonNullable<ControllerQuery["controller"]>;
      rpcUrl: string;
      loginResponse: LoginResponse;
      authenticationMethod: AuthOption;
    }) => {
      // Verify correct EVM wallet account is selected
      if (authenticationMethod !== "password") {
        const connectedAddress = signerToAddress(loginResponse.signer);
        const possibleSigners = controller.signers?.filter(
          (signer) =>
            credentialToAuth(signer.metadata as CredentialMetadata) ===
            authenticationMethod,
        );
        if (!possibleSigners || possibleSigners.length === 0) {
          throw new Error(
            "No signers found for controller expected " +
              connectedAddress +
              "found" +
              possibleSigners,
          );
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
      }

      const loginRet = await Controller.login({
        appId: origin,
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

      window.controller = loginRet.controller;
      setController(loginRet.controller);
    },
    [origin, setController],
  );

  const handleLogin = useCallback(
    async (
      username: string,
      authenticationMethod: AuthOption,
      password?: string,
    ) => {
      if (!chainId) {
        throw new Error("No chainId");
      }

      const controller = (await fetchController(chainId, username))?.controller;
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
            !!isSlot,
          );
          return;
        }
        case "google":
        case "discord": {
          setWaitingForConfirmation(true);
          loginResponse = await loginWithSocial(authenticationMethod, username);
          if (!loginResponse) {
            return;
          }
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
        case "password": {
          if (!password) {
            throw new Error("Password required for password authentication");
          }

          // Find the password signer from the controller's signers
          const passwordSigners = controller.signers?.filter(
            (signer) =>
              (signer.metadata as { __typename?: string }).__typename ===
              "PasswordCredentials",
          );
          if (!passwordSigners || passwordSigners.length === 0) {
            throw new Error("Password signer not found for controller");
          }

          // Extract the encrypted private key from metadata
          const passwordMetadata = passwordSigners[0].metadata as {
            __typename: string;
            password?: Array<{
              encryptedPrivateKey: string;
              publicKey: string;
            }>;
          };
          const encryptedPrivateKey =
            passwordMetadata.password?.[0]?.encryptedPrivateKey;

          if (!encryptedPrivateKey) {
            throw new Error("Encrypted private key not found");
          }

          // Encrypted private key is already in base64 format from backend
          loginResponse = await passwordAuth.login(
            password,
            encryptedPrivateKey,
          );
          break;
        }
        case "phantom":
        case "argent":
        default:
          throw new Error("Unknown login method");
      }

      if (!loginResponse) {
        throw new Error("Login failed");
      }

      await finishLogin({
        controller,
        loginResponse,
        authenticationMethod,
        rpcUrl,
      });
    },
    [
      isSlot,
      loginWithWebauthn,
      loginWithSocial,
      loginWithWalletConnect,
      loginWithExternalWallet,
      chainId,
      rpcUrl,
      finishLogin,
      passwordAuth,
      setWaitingForConfirmation,
    ],
  );

  useEffect(() => {
    if (!chainId) return;
    if (
      window.location.search.includes("code") &&
      window.location.search.includes("state")
    ) {
      (async () => {
        setIsLoading(true);
        try {
          const turnkeyWallet = new TurnkeyWallet(
            "unknown",
            constants.StarknetChainId.SN_SEPOLIA,
            "unknown",
            undefined,
          );

          const {
            account,
            username,
            socialProvider,
            isSignup,
            searchParams,
            chainId,
            rpcUrl,
          } = await turnkeyWallet.handleRedirect(
            window.location.href,
            setError,
          );

          if (error) {
            throw error;
          }
          if (
            !username ||
            isSignup === undefined ||
            !socialProvider ||
            !account
          ) {
            return;
          }
          if (searchParams) {
            setSearchParams(searchParams);
          }

          if (!window.keychain_wallets) {
            throw new Error("Keychain wallets isn't present");
          }
          window.keychain_wallets?.addEmbeddedWallet(
            account,
            turnkeyWallet as unknown as WalletAdapter,
          );

          if (isSignup) {
            await finishSignup({
              username,
              chainId,
              rpcUrl,
              signupResponse: {
                address: account,
                signer: {
                  eip191: {
                    address: account,
                  },
                },
                type: socialProvider as AuthOption,
              },
              signer: {
                type: SignerType.Eip191,
                credential: JSON.stringify({
                  provider: socialProvider,
                  eth_address: account,
                }),
              },
            });
          } else {
            const controller = await fetchController(chainId, username);
            if (!controller || !controller.controller) {
              throw new Error("Controller not found");
            }

            await finishLogin({
              controller: controller.controller,
              loginResponse: {
                signer: {
                  eip191: {
                    address: account,
                  },
                },
              },
              authenticationMethod: socialProvider as AuthOption,
              rpcUrl,
            });
          }
        } catch (e) {
          setError(e as Error);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [
    error,
    setIsLoading,
    finishLogin,
    finishSignup,
    setSearchParams,
    chainId,
    setError,
  ]);

  const handleSubmit = useCallback(
    async (
      username: string,
      exists: boolean,
      authenticationMethod?: AuthOption,
      password?: string,
    ) => {
      setError(undefined);
      setIsLoading(true);

      setAuthMethod(authenticationMethod);

      try {
        if (exists) {
          await handleLogin(
            username,
            authenticationMethod ?? "webauthn",
            password,
          );
        } else {
          await handleSignup(
            username,
            authenticationMethod ?? "webauthn",
            password,
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
      } finally {
        if (exists) {
          setWaitingForConfirmation(false);
        }
      }
      setIsLoading(false);
    },
    [
      handleLogin,
      handleSignup,
      doPopupFlow,
      setAuthMethod,
      setError,
      setIsLoading,
      setWaitingForConfirmation,
    ],
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
    setAuthMethod,
  };
}
