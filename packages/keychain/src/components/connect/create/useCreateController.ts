import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { STABLE_CONTROLLER } from "@/components/provider/upgrade";
import { DEFAULT_SESSION_DURATION, now } from "@/constants";
import { useConnection } from "@/hooks/connection";
import { useWallets } from "@/hooks/wallets";
import Controller from "@/utils/controller";
import { TurnkeyWallet } from "@/wallets/social/turnkey";
import {
  AuthOption,
  AuthOptions,
  EMBEDDED_WALLETS,
  ResponseCodes,
  WalletAdapter,
} from "@cartridge/controller";
import { computeAccountAddress, Signer } from "@cartridge/controller-wasm";
import {
  ControllerQuery,
  CredentialMetadata,
  SignerInput,
  SignerType,
  WebauthnCredentials,
} from "@cartridge/controller-ui/utils/api/cartridge";
import { getAddress } from "ethers";
import { useSearchParams } from "react-router-dom";
import { constants, shortString } from "starknet";
import {
  credentialToAddress,
  credentialToAuth,
  signerToAddress,
} from "../types";
import { useExternalWalletAuthentication } from "./external-wallet";
import { usePasswordAuthentication } from "./password";
import { SmsUsernameNotFoundError, useSmsAuthentication } from "./sms";
import { useSocialAuthentication } from "./social";
import { AuthenticationStep, fetchController } from "./utils";
import { useWalletConnectAuthentication } from "./wallet-connect";
import { useWebauthnAuthentication } from "./webauthn";
import { cleanupCallbacks } from "@/utils/connection/callbacks";
import { useRouteCallbacks, useRouteCompletion } from "@/hooks/route";
import { parseConnectParams } from "@/utils/connection/connect";
import { ParsedSessionPolicies } from "@/hooks/session";
import { safeRedirect } from "@/utils/url-validator";
import {
  canAutoCreateSession,
  createVerifiedSession,
} from "@/utils/connection/session-creation";
import { hasConfiguredLocationGate } from "@/utils/location-gate";
import { posthog } from "@/components/provider/posthog";
import {
  captureAnalyticsEvent,
  categorizeError,
  sanitizeErrorCode,
  type SignupAuthStep,
  type SignupErrorCategory,
} from "@/types/analytics";
import { SmsOtpState } from "./sms/SmsOtpForm";

const CANCEL_RESPONSE = {
  code: ResponseCodes.CANCELED,
  message: "Canceled",
};

function mapAuthStep(step: AuthenticationStep): SignupAuthStep {
  switch (step) {
    case AuthenticationStep.FillForm:
      return "fill_form";
    case AuthenticationStep.ChooseMethod:
      return "choose_method";
    case AuthenticationStep.PasswordForm:
      return "password_form";
    case AuthenticationStep.SmsForm:
      return "sms_form";
    case AuthenticationStep.Pending:
      return "pending";
    case AuthenticationStep.Error:
      return "error";
  }
}

export interface SignupResponse {
  address: string;
  signer: Signer;
  type: AuthOption;
}

export interface LoginResponse {
  signer: Signer;
}

const resolveConnect = async ({
  controller,
  params,
  handleCompletion,
  closeModal,
  searchParams,
  missingParamsMessage,
  isNewController,
}: {
  controller: Controller;
  params?: ReturnType<typeof parseConnectParams>;
  handleCompletion: () => void;
  closeModal?: () => void;
  searchParams: URLSearchParams;
  missingParamsMessage: string;
  isNewController: boolean;
}) => {
  let currentParams = params;
  if (!currentParams) {
    for (let i = 0; i < 5; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      currentParams = parseConnectParams(searchParams);
      if (currentParams) {
        break;
      }
    }
  }

  if (!currentParams) {
    console.warn(missingParamsMessage);
    closeModal?.();
    return;
  }

  const url = new URL(window.location.href);
  url.search = "";
  window.history.replaceState(null, "", url.toString());

  currentParams.resolve?.({
    code: ResponseCodes.SUCCESS,
    address: controller.address(),
    keepOpen: isNewController,
  });
  if (currentParams.params.id) {
    cleanupCallbacks(currentParams.params.id);
  }
  handleCompletion();
};

const createSession = async ({
  controller,
  origin,
  policies,
  params,
  handleCompletion,
  closeModal,
  searchParams,
  isNewController,
}: {
  controller: Controller;
  origin: string;
  policies?: ParsedSessionPolicies;
  params?: ReturnType<typeof parseConnectParams>;
  handleCompletion: () => void;
  closeModal?: () => void;
  searchParams: URLSearchParams;
  isNewController: boolean;
}) => {
  // Handle no policies case - try to resolve connection, fallback to just closing modal
  if (!policies) {
    await resolveConnect({
      controller,
      params,
      handleCompletion,
      closeModal,
      searchParams,
      missingParamsMessage:
        "No params available for no-policies case, falling back to closeModal",
      isNewController,
    });
    return;
  }

  // For verified policies, we need params to properly notify parent
  // Try to wait for params briefly if not available
  let currentParams = params;
  if (!currentParams) {
    // Brief wait for params to be available (up to 500ms)
    for (let i = 0; i < 5; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      currentParams = parseConnectParams(searchParams);
      if (currentParams) break;
    }
  }

  if (!currentParams) {
    console.error(
      "Params not available for verified policies, cannot resolve connection",
    );
    // Don't close modal - let normal flow handle it
    return;
  }

  try {
    await createVerifiedSession({
      controller,
      origin,
      policies,
    });
    currentParams.resolve?.({
      code: ResponseCodes.SUCCESS,
      address: controller.address(),
      keepOpen: isNewController,
    });
    if (currentParams.params.id) {
      cleanupCallbacks(currentParams.params.id);
    }
    handleCompletion();
  } catch (e) {
    console.error("Failed to create verified session:", e);
    // Fall back to showing the UI if auto-creation fails
    currentParams.reject?.(e);
  }
  return;
};

const completePopupConnect = async ({
  controller,
  params,
  handleCompletion,
  closeModal,
  searchParams,
  isNewController,
}: {
  controller: Controller;
  params?: ReturnType<typeof parseConnectParams>;
  handleCompletion: () => void;
  closeModal?: () => void;
  searchParams: URLSearchParams;
  isNewController: boolean;
}) => {
  await resolveConnect({
    controller,
    params,
    handleCompletion,
    closeModal,
    searchParams,
    missingParamsMessage:
      "Params not available after popup auth, falling back to closeModal",
    isNewController,
  });
};

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
  const [changeWallet, setChangeWallet] = useState<boolean>(false);
  const [smsState, setSmsState] = useState<SmsOtpState | null>(null);

  const [authMethod, setAuthMethod] = useState<AuthOption | undefined>(
    undefined,
  );
  const [authenticationStep, setAuthenticationStep] =
    useState<AuthenticationStep>(AuthenticationStep.FillForm);

  const signupAttemptIndexRef = useRef(0);
  const signupMethodsTriedRef = useRef<AuthOption[]>([]);
  const signupPreviousMethodRef = useRef<AuthOption | undefined>(undefined);
  const signupPreviousErrorCategoryRef = useRef<
    SignupErrorCategory | undefined
  >(undefined);
  const signupStartedRef = useRef(false);
  const signupResolvedRef = useRef(false);
  const signupStartTimeRef = useRef(performance.now());
  const authStepRef = useRef<AuthenticationStep>(AuthenticationStep.FillForm);

  useEffect(() => {
    authStepRef.current = authenticationStep;
  }, [authenticationStep]);

  useEffect(() => {
    const handlePageHide = () => {
      if (!signupStartedRef.current || signupResolvedRef.current) return;
      captureAnalyticsEvent(posthog, "signup_abandoned", {
        last_step: mapAuthStep(authStepRef.current),
        methods_tried: [...signupMethodsTriedRef.current],
        attempt_count: signupAttemptIndexRef.current,
        time_on_page_ms: Math.round(
          performance.now() - signupStartTimeRef.current,
        ),
      });
    };
    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, []);

  const [searchParams, setSearchParams] = useSearchParams();
  const {
    origin,
    rpcUrl,
    chainId,
    setController,
    policies,
    isConfigLoading,
    isPoliciesResolved,
    locationGate,
    locationGateVerified,
    setIsNewController,
    webauthnPopup,
  } = useConnection();

  // When location gate is configured and not yet verified, skip auto-session
  // creation and connect resolution. The natural re-render will show LocationGate
  // (since the URL is still /location-gate), and after verification LocationGate
  // navigates to /connect where ConnectRoute handles session + resolution.
  const locationGatePending =
    hasConfiguredLocationGate(locationGate) && !locationGateVerified;

  // Import route params and completion for connection resolution
  const params = useMemo(() => {
    return parseConnectParams(searchParams);
  }, [searchParams]);
  const handleCompletion = useRouteCompletion();
  const hasPolicies = !!policies;
  const shouldAutoCreateSession = canAutoCreateSession(policies);

  const {
    signup: signupWithWebauthn,
    login: loginWithWebauthn,
    loginViaPopup: loginWithWebauthnPopup,
  } = useWebauthnAuthentication();
  const { signup: signupWithSocial, login: loginWithSocial } =
    useSocialAuthentication(setChangeWallet);
  const { signup: signupWithExternalWallet, login: loginWithExternalWallet } =
    useExternalWalletAuthentication();
  const { signup: signupWithWalletConnect, login: loginWithWalletConnect } =
    useWalletConnectAuthentication();
  const passwordAuth = usePasswordAuthentication();
  const smsAuth = useSmsAuthentication();
  const { supportedWalletsForAuth } = useWallets();

  const handleInitOtp = useCallback(
    async (phoneNumber: string) => {
      try {
        setError(undefined);
        setSmsState({ phoneNumber, otpId: "", otpEncryptionTargetBundle: "" });
        const { otpId, otpEncryptionTargetBundle } = await smsAuth.initSms({
          phoneNumber,
        });
        setSmsState({ phoneNumber, otpId, otpEncryptionTargetBundle });
      } catch (e: unknown) {
        setError(e as Error);
        setAuthMethod("sms"); // still not set, needed to open error screen
        setAuthenticationStep(AuthenticationStep.Error);
      }
    },
    [smsAuth],
  );

  // For returning SMS users we try to skip the phone-entry step by deriving
  // the OTP session from the username. On success we pre-fill smsState with a
  // masked display string (using phoneLast4) so the existing otpId-driven
  // form lands directly on the OTP step. On a 404 (no SMS signer, decrypt
  // failed, etc.) the spec says to silently fall back to phone entry.
  const handleInitOtpWithUsername = useCallback(
    async (username: string): Promise<void> => {
      setError(undefined);
      try {
        setSmsState({
          username,
          phoneNumber: "*** *** ****",
          otpId: "",
          otpEncryptionTargetBundle: "",
        });
        const { otpId, otpEncryptionTargetBundle, phoneLast4 } =
          await smsAuth.initSms({ username });
        if (phoneLast4) {
          setSmsState({
            username,
            phoneNumber: `*** *** ${phoneLast4}`,
            otpId,
            otpEncryptionTargetBundle,
          });
        } else {
          // Defensive: backend should always return phoneLast4 on the
          // username path. If it doesn't, fall back to phone entry rather
          // than landing on an OTP step with no destination shown.
          setSmsState(null);
        }
      } catch (e: unknown) {
        // if username not found, ask user for phone number
        const usernameNotFound = e instanceof SmsUsernameNotFoundError;
        if (usernameNotFound) {
          setSmsState(null);
        } else {
          setError(e as Error);
          setAuthMethod("sms"); // still not set, needed to open error screen
          setAuthenticationStep(AuthenticationStep.Error);
          return;
        }
      }
      setAuthenticationStep(AuthenticationStep.SmsForm);
    },
    [smsAuth],
  );

  useEffect(() => {
    if (authenticationStep === AuthenticationStep.FillForm) {
      setSmsState(null);
    }
  }, [authenticationStep]);

  useRouteCallbacks(params, CANCEL_RESPONSE);

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
      overrideOrigin,
      skipSessionCreation,
    }: {
      username: string;
      chainId: string;
      rpcUrl: string;
      signupResponse: SignupResponse;
      signer: SignerInput;
      /** Explicit origin for OAuth redirect paths where closure value may be stale. */
      overrideOrigin?: string;
      /** Skip session creation (e.g. during OAuth redirect when policies aren't loaded yet). */
      skipSessionCreation?: boolean;
    }) => {
      const effectiveOrigin = overrideOrigin ?? origin;
      const classHash = STABLE_CONTROLLER.hash;
      const owner = {
        signer: signupResponse.signer,
      };
      const salt = shortString.encodeShortString(username);
      const address = computeAccountAddress(classHash, owner, salt);

      const { controller, session } = await Controller.login({
        appId: effectiveOrigin,
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
          appId: effectiveOrigin,
        },
      });

      if (registerRet.register.username) {
        window.controller = controller;
        setController(controller);

        // When called from the OAuth redirect path, skip session creation and
        // post-login navigation. The restored URL params will trigger preset
        // config loading, which remounts the tree and lets the normal connect
        // flow handle session creation with fully-loaded policies.
        if (skipSessionCreation) {
          return;
        }

        // Check if this is a standalone redirect flow
        const urlSearchParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlSearchParams.get("redirect_url");

        // if (redirectUrl) {
        //   // Standalone flow: skip session creation here, redirect immediately
        //   // Session will be created on the application site after redirect
        //   const username = controller.username();

        //   // Build redirect URL with username and controller_standalone parameters
        //   const redirectUrlObj = new URL(redirectUrl);
        //   redirectUrlObj.searchParams.set("controller_standalone", "1");
        //   if (username) {
        //     redirectUrlObj.searchParams.set("username", username);
        //   }

        //   // Safely redirect to the specified URL with parameters
        //   safeRedirect(redirectUrlObj.toString());
        //   return; // Don't continue with session creation
        // }

        // If location gate is pending, skip session creation and connect
        // resolution. The re-render will show LocationGate at the current URL;
        // after verification it navigates to /connect where ConnectRoute handles
        // session creation and resolution.
        if (locationGatePending) {
          return;
        }

        // Normal embedded flow: handle session creation for auto-close cases
        if (shouldAutoCreateSession) {
          await createSession({
            controller,
            origin: effectiveOrigin,
            policies,
            params,
            handleCompletion,
            searchParams,
            isNewController: true,
          });
        }

        if (redirectUrl) {
          safeRedirect(redirectUrl);
        }
      }
    },
    [
      setController,
      origin,
      policies,
      locationGatePending,
      handleCompletion,
      params,
      searchParams,
      shouldAutoCreateSession,
    ],
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
        case "webauthn": {
          const webauthnResult = await signupWithWebauthn(username);

          if (webauthnResult?.completedInPopup) {
            if (!locationGatePending) {
              await completePopupConnect({
                controller: webauthnResult.controller,
                params,
                handleCompletion,
                searchParams,
                isNewController: true,
              });
            }
            return;
          }

          // Handle redirect_url for webauthn
          const urlSearchParams = new URLSearchParams(window.location.search);
          const redirectUrl = urlSearchParams.get("redirect_url");
          if (redirectUrl) {
            safeRedirect(redirectUrl);
          }
          return;
        }
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
        case "rabby":
        case "phantom-evm":
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
        case "sms": {
          if (!password) {
            throw new Error("OTP code required for SMS authentication");
          }
          if (!smsState?.otpId) {
            throw new Error("SMS not initialized — phone number not submitted");
          }
          signupResponse = await smsAuth.completeSms(
            username,
            smsState.phoneNumber,
            smsState.otpId,
            smsState.otpEncryptionTargetBundle,
            password,
          );
          signer = {
            type: SignerType.Eip191,
            // otp_id rides inside the opaque credential JSON so the server
            // can prove this signer's phone was just OTP-verified. The
            // GraphQL schema and the controller-wasm bindings don't need
            // to know the field exists; the resolver pulls it out of the
            // raw map, claims the post-verify Redis entry atomically, and
            // strips otp_id before persisting Signer.metadata.
            credential: JSON.stringify({
              provider: "sms",
              eth_address: signupResponse.address,
              otp_id: smsState.otpId,
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
      signupWithExternalWallet,
      signupWithSocial,
      signupWithWebauthn,
      signupWithWalletConnect,
      passwordAuth,
      smsAuth,
      smsState,
      finishSignup,
      locationGatePending,
      params,
      handleCompletion,
      searchParams,
    ],
  );

  const finishLogin = useCallback(
    async ({
      controller,
      rpcUrl,
      loginResponse,
      authenticationMethod,
      overrideOrigin,
      skipSessionCreation,
    }: {
      controller: NonNullable<ControllerQuery["controller"]>;
      rpcUrl: string;
      loginResponse: LoginResponse;
      authenticationMethod: AuthOption;
      /** Explicit origin for OAuth redirect paths where closure value may be stale. */
      overrideOrigin?: string;
      /** Skip session creation (e.g. during OAuth redirect when policies aren't loaded yet). */
      skipSessionCreation?: boolean;
    }) => {
      const effectiveOrigin = overrideOrigin ?? origin;

      // Verify correct EVM wallet account is selected
      if (authenticationMethod !== "password") {
        const normalizeAddress = (address?: string) => {
          if (!address) return undefined;
          try {
            return getAddress(address);
          } catch {
            return address.toLowerCase();
          }
        };

        const connectedAddress = normalizeAddress(
          signerToAddress(loginResponse.signer),
        );
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
              normalizeAddress(
                credentialToAddress(signer.metadata as CredentialMetadata),
              ) === connectedAddress,
          )
        ) {
          setChangeWallet(true);
          setError(new Error("Wrong Signer"));
          return;
        }
      }

      const loginRet = await Controller.login({
        appId: effectiveOrigin,
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

      // When called from the OAuth redirect path, skip session creation and
      // post-login navigation. The restored URL params will trigger preset
      // config loading, which remounts the tree and lets the normal connect
      // flow handle session creation with fully-loaded policies.
      if (skipSessionCreation) {
        return;
      }

      // Check if this is a standalone redirect flow
      const urlSearchParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlSearchParams.get("redirect_url");

      // if (redirectUrl) {
      //   // Standalone flow: skip session creation here, redirect immediately
      //   // Session will be created on the application site after redirect
      //   const username = loginRet.controller.username();

      //   // Build redirect URL with username and controller_standalone parameters
      //   const redirectUrlObj = new URL(redirectUrl);
      //   redirectUrlObj.searchParams.set("controller_standalone", "1");
      //   if (username) {
      //     redirectUrlObj.searchParams.set("username", username);
      //   }

      //   // Safely redirect to the specified URL with parameters
      //   safeRedirect(redirectUrlObj.toString());
      //   return; // Don't continue with session creation
      // }

      // If location gate is pending, skip session creation and connect
      // resolution. The re-render will show LocationGate at the current URL;
      // after verification it navigates to /connect where ConnectRoute handles
      // session creation and resolution.
      if (locationGatePending) {
        return;
      }

      // Normal embedded flow: handle session creation for auto-close cases
      if (shouldAutoCreateSession) {
        await createSession({
          controller: loginRet.controller,
          origin: effectiveOrigin,
          policies,
          params,
          handleCompletion,
          searchParams,
          isNewController: false,
        });
      }

      if (redirectUrl) {
        safeRedirect(redirectUrl);
      }
    },
    [
      origin,
      setController,
      policies,
      locationGatePending,
      handleCompletion,
      params,
      searchParams,
      shouldAutoCreateSession,
    ],
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

      // Safari blocks window.open() if any await runs between the user
      // gesture and the call. The popup path doesn't need fetchController
      // here (the popup itself looks up the controller from the username),
      // so route to it before any async work to keep the gesture intact.
      if (authenticationMethod === "webauthn" && webauthnPopup.get) {
        const loginController = await loginWithWebauthnPopup(username);
        if (!loginController) {
          throw new Error("Login failed");
        }
        if (loginController.completedInPopup && !locationGatePending) {
          await completePopupConnect({
            controller: loginController.controller,
            params,
            handleCompletion,
            searchParams,
            isNewController: false,
          });
        }
        return;
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
          const loginController = await loginWithWebauthn(
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
          if (!loginController) {
            throw new Error("Login failed");
          }

          if (loginController.completedInPopup) {
            if (!locationGatePending) {
              await completePopupConnect({
                controller: loginController.controller,
                params,
                handleCompletion,
                searchParams,
                isNewController: false,
              });
            }
            return;
          }

          if (shouldAutoCreateSession && !locationGatePending) {
            await createSession({
              controller: loginController.controller,
              origin,
              policies,
              params,
              handleCompletion,
              searchParams,
              isNewController: false,
            });
          }

          // Handle redirect_url for webauthn
          const urlSearchParams = new URLSearchParams(window.location.search);
          const redirectUrl = urlSearchParams.get("redirect_url");
          if (redirectUrl) {
            safeRedirect(redirectUrl);
          }
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
        case "metamask":
        case "phantom-evm": {
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
        case "sms": {
          if (!smsState?.otpId) {
            throw new Error("SMS not initialized — phone number not submitted");
          }
          if (!password) {
            throw new Error("OTP code required for SMS authentication");
          }
          const smsResult = await smsAuth.completeSms(
            username,
            smsState.phoneNumber,
            smsState.otpId,
            smsState.otpEncryptionTargetBundle,
            password,
          );
          loginResponse = { signer: smsResult.signer };
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
      loginWithWebauthnPopup,
      webauthnPopup,
      loginWithSocial,
      loginWithWalletConnect,
      loginWithExternalWallet,
      chainId,
      origin,
      rpcUrl,
      policies,
      locationGatePending,
      params,
      handleCompletion,
      searchParams,
      shouldAutoCreateSession,
      finishLogin,
      passwordAuth,
      smsAuth,
      smsState,
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

          if (!window.keychain_wallets) {
            throw new Error("Keychain wallets isn't present");
          }
          window.keychain_wallets?.addEmbeddedWallet(
            account,
            turnkeyWallet as unknown as WalletAdapter,
          );

          // Extract origin from the saved searchParams so registration uses
          // the correct appId, rather than relying on the (possibly stale)
          // closure value which may not have loaded yet due to preset config.
          const savedOrigin =
            searchParams?.get("origin") || window.location.origin;

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
              overrideOrigin: savedOrigin,
              skipSessionCreation: true,
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
              overrideOrigin: savedOrigin,
              skipSessionCreation: true,
            });
          }

          // Restore the original URL params (including preset) AFTER
          // signup/login completes. Restoring earlier triggers preset config
          // loading (isConfigLoading=true), which unmounts the entire
          // component tree via the provider's loading guard, orphaning
          // the in-flight signup/login async operation.
          if (searchParams) {
            setSearchParams(searchParams);
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
      setIsNewController(!exists);

      setAuthMethod(authenticationMethod);

      const method = authenticationMethod ?? "webauthn";
      const startTime = performance.now();

      if (exists) {
        captureAnalyticsEvent(posthog, "login_started", {});
      } else {
        signupStartedRef.current = true;
        signupAttemptIndexRef.current += 1;
        const attemptIndex = signupAttemptIndexRef.current;
        const previousMethod = signupPreviousMethodRef.current;
        const previousErrorCategory = signupPreviousErrorCategoryRef.current;
        if (!signupMethodsTriedRef.current.includes(method)) {
          signupMethodsTriedRef.current.push(method);
        }
        captureAnalyticsEvent(posthog, "signup_started", {
          has_existing_account: false,
        });
        captureAnalyticsEvent(posthog, "signup_method_selected", {
          method,
          attempt_index: attemptIndex,
          previous_method: previousMethod,
        });
        captureAnalyticsEvent(posthog, "signup_method_attempted", {
          method,
          attempt_index: attemptIndex,
          previous_method: previousMethod,
          previous_error_category: previousErrorCategory,
        });
        signupPreviousMethodRef.current = method;
      }

      try {
        if (exists) {
          await handleLogin(username, method, password);
          // Only emit completed if controller was actually set
          // (handleLogin may return early for popup/redirect/cancel)
          if (window.controller) {
            captureAnalyticsEvent(posthog, "login_completed", {
              method,
              duration_ms: Math.round(performance.now() - startTime),
            });
          }
        } else {
          await handleSignup(username, method, password);
          if (window.controller) {
            signupResolvedRef.current = true;
            captureAnalyticsEvent(posthog, "signup_completed", {
              method,
              duration_ms: Math.round(performance.now() - startTime),
              attempt_count: signupAttemptIndexRef.current,
              methods_tried: [...signupMethodsTriedRef.current],
            });
          }
        }
      } catch (e: unknown) {
        const error = (e as Error)?.message
          ? (e as Error)
          : new Error("Unknown error");
        console.error("Login error:", error.message);
        setError(error);
        if (exists) {
          captureAnalyticsEvent(posthog, "login_failed", {
            method,
            error_code: sanitizeErrorCode(error),
          });
        } else {
          const errorCategory = categorizeError(error, method);
          signupPreviousErrorCategoryRef.current = errorCategory;
          captureAnalyticsEvent(posthog, "signup_failed", {
            method,
            error_code: sanitizeErrorCode(error),
            error_category: errorCategory,
          });
        }
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
      setAuthMethod,
      setError,
      setIsLoading,
      setWaitingForConfirmation,
      setIsNewController,
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
    handleInitOtp,
    handleInitOtpWithUsername,
    smsState,
    setSmsState,
    changeWallet,
    setChangeWallet,
    signupOptions,
    authMethod,
    setAuthMethod,
    shouldAutoCreateSession,
    isConfigLoading,
    isPoliciesResolved,
    hasPolicies,
  };
}
