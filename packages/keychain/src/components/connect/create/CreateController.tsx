import { NavigationHeader } from "@/components";
import { ErrorAlert } from "@/components/ErrorAlert";
import { VerifiableControllerTheme } from "@/components/provider/connection";
import { useConnection, useControllerTheme } from "@/hooks/connection";
import { useDebounce } from "@/hooks/debounce";
import { allUseSameAuth } from "@/utils/controller";
import { AuthOption, AuthOptions } from "@cartridge/controller";
import {
  CartridgeLogo,
  ControllerIcon,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/controller-ui";
import { CreateAccount } from "./username";
import InAppSpy from "inapp-spy";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AuthButton } from "../buttons/auth-button";
import { ChangeWallet } from "../buttons/change-wallet";
import { credentialToAuth } from "../types";
import { ChooseSignupMethodForm } from "./ChooseSignupMethodForm";
import { Legal } from "./Legal";
import { useCreateController } from "./useCreateController";
import { useUsernameValidation } from "./useUsernameValidation";
import { AuthenticationStep } from "./utils";
import {
  getIOSVersion,
  isSafari,
  useDetectKeyboardOpen,
  usePreventOverScrolling,
} from "@/hooks/viewport";
import { useDevice } from "@/hooks/device";
import { posthog } from "@/components/provider/posthog";
import { captureAnalyticsEvent } from "@/types/analytics";
import { AccountSearchResult } from "@/hooks/account";
import { PasswordFormDrawer } from "./password/PasswordForm";
import { SmsOtpDrawer } from "./sms/SmsOtpForm";
import { SignerPendingDrawer } from "./SignerPendingDrawer";

interface CreateControllerViewProps {
  theme: VerifiableControllerTheme;
  usernameField: {
    value: string;
    error?: Error;
  };
  validation: ReturnType<typeof useUsernameValidation>;
  isLoading: boolean;
  error?: Error;
  setError: (error: Error | undefined) => void;
  prefillUsername?: string;
  onUsernameChange: (value: string) => void;
  onUsernameFocus: () => void;
  onUsernameClear: () => void;
  onSubmit: (authenticationMode?: AuthOption, otpCode?: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onInitOtp: (phoneNumber: string) => Promise<void>;
  smsState: {
    phoneNumber: string;
    otpId: string;
    otpEncryptionTargetBundle: string;
  } | null;
  isSlot?: boolean;
  authenticationStep: AuthenticationStep;
  setAuthenticationStep: (value: AuthenticationStep) => void;
  waitingForConfirmation: boolean;
  changeWallet: boolean;
  setChangeWallet: (value: boolean) => void;
  authOptions: AuthOptions;
  authMethod: AuthOption | undefined;
  submitButtonRef: React.RefObject<HTMLButtonElement>;
  isDropdownOpen: boolean;
  onDropdownOpenChange: (isOpen: boolean) => void;
  webauthnPopup: {
    create: boolean;
    get: boolean;
  };
}

type CreateControllerFormProps = Omit<
  CreateControllerViewProps,
  | "setAuthenticationStep"
  | "onInitOtp"
  | "smsState"
  | "changeWallet"
  | "setChangeWallet"
  | "authMethod"
>;

function CreateControllerForm({
  theme,
  usernameField,
  validation,
  isLoading,
  error,
  prefillUsername,
  onUsernameChange,
  onUsernameFocus,
  onUsernameClear,
  onKeyDown,
  onSubmit,
  waitingForConfirmation,
  authenticationStep,
  submitButtonRef,
  isDropdownOpen,
  onDropdownOpenChange,
  authOptions,
  isSlot,
  webauthnPopup,
}: CreateControllerFormProps) {
  const [{ isInApp, appKey, appName }] = useState(() => InAppSpy());
  const { isOpen: keyboardIsOpen, viewportHeight } = useDetectKeyboardOpen();
  const { isMobile } = useDevice();
  const [pendingSubmitAfterKeyboardClose, setPendingSubmitAfterKeyboardClose] =
    useState(false);
  const prevKeyboardIsOpen = useRef(keyboardIsOpen);

  // Track when keyboard closes and auto-submit if there was a pending submission
  useEffect(() => {
    if (
      prevKeyboardIsOpen.current &&
      !keyboardIsOpen &&
      pendingSubmitAfterKeyboardClose
    ) {
      // Keyboard just closed and we have a pending submit
      setPendingSubmitAfterKeyboardClose(false);
      // Small delay to ensure keyboard animation is complete
      setTimeout(() => {
        onSubmit();
      }, 100);
    }
    prevKeyboardIsOpen.current = keyboardIsOpen;
  }, [keyboardIsOpen, pendingSubmitAfterKeyboardClose, onSubmit]);

  // appKey is undefined for unknown applications which we're
  // assuming are dojo applications which implement AASA and
  // support using passkeys in the inapp browser.
  // https://docs.cartridge.gg/controller/presets#apple-app-site-association
  const isInAppBrowser = isInApp && !!appKey;

  const layoutRef = usePreventOverScrolling<HTMLFormElement>();

  const layoutHeight = useMemo(() => {
    if (isMobile) {
      if (keyboardIsOpen) {
        if (!isSafari(navigator.userAgent)) {
          return viewportHeight;
        }

        const iOSVersion = getIOSVersion(navigator.userAgent);
        if (!iOSVersion) {
          return "100%";
        }

        // Liquid glass safari
        if (iOSVersion >= 26) {
          return viewportHeight - 475;
        }

        // old safari
        return viewportHeight - 160;
      } else {
        return "100%";
      }
    } else {
      return "100%";
    }
  }, [isMobile, keyboardIsOpen, viewportHeight]);

  const [selectedAccount, setSelectedAccount] = useState<
    AccountSearchResult | undefined
  >();

  const handleAccountSelect = (result: AccountSearchResult) => {
    setSelectedAccount(result);
    onUsernameChange(result.username);
  };

  const handleRemovePill = useCallback(() => {
    setSelectedAccount(undefined);
    onUsernameChange("");
    onUsernameClear();
  }, [onUsernameChange, onUsernameClear]);

  const handleEditPill = useCallback(() => {
    setSelectedAccount(undefined);
  }, []);

  return (
    <>
      <NavigationHeader
        variant="expanded"
        title={
          theme.name.toLowerCase() === "cartridge"
            ? "Connect Controller"
            : `Connect to ${theme.name}`
        }
        hideNetwork
        hideUsername
        hideSettings
        forceShowClose
      />
      <form
        className="flex flex-col overflow-y-scroll"
        style={{
          scrollbarWidth: "none",
          height: layoutHeight,
        }}
        ref={layoutRef}
        onSubmit={(e) => {
          e.preventDefault();
          // Don't submit if dropdown is open
          if (isDropdownOpen) {
            return;
          }

          if (keyboardIsOpen) {
            // If keyboard is open, mark for pending submit after it closes
            setPendingSubmitAfterKeyboardClose(true);
          } else {
            onSubmit();
          }
        }}
      >
        <LayoutContent className="overflow-y-hidden">
          <CreateAccount
            usernameField={usernameField}
            validation={validation}
            error={error}
            isLoading={isLoading}
            readOnly={!!prefillUsername}
            onUsernameChange={onUsernameChange}
            onUsernameFocus={onUsernameFocus}
            onUsernameClear={onUsernameClear}
            onKeyDown={onKeyDown}
            showAutocomplete={!prefillUsername}
            selectedAccount={selectedAccount}
            onAccountSelect={handleAccountSelect}
            onSelectedUsernameRemove={handleRemovePill}
            onSelectedUsernameEdit={handleEditPill}
            onDropdownOpenChange={onDropdownOpenChange}
          />
          <Legal />
        </LayoutContent>

        <LayoutFooter className="pb-2">
          {isInAppBrowser && (
            <ErrorAlert
              title={`Using Controller in ${appName ?? "Unknown App"} is not supported`}
              description="Please open this page in your device's native browser (Safari/Chrome) to continue."
              variant="info"
              isExpanded
            />
          )}

          {!theme.verified && !isSlot && (
            <ErrorAlert
              title="Please proceed with caution"
              isExpanded={false}
              description="Application domain does not match the configured domain."
              variant="error"
            />
          )}

          <AuthButton
            ref={submitButtonRef}
            type="submit"
            isLoading={isLoading}
            disabled={
              validation.status !== "valid" ||
              authenticationStep !== AuthenticationStep.FillForm ||
              isDropdownOpen
            }
            data-testid="submit-button"
            validation={validation}
            waitingForConfirmation={waitingForConfirmation}
            username={usernameField.value}
            signupOptions={authOptions}
            webauthnPopup={webauthnPopup}
            onMouseDown={() => {
              if (keyboardIsOpen) {
                // If keyboard is open, mark for pending submit after it closes
                setPendingSubmitAfterKeyboardClose(true);
              }
            }}
          />

          {keyboardIsOpen && isMobile ? null : <CartridgeFooter />}
        </LayoutFooter>
      </form>
    </>
  );
}

export function CreateControllerView({
  theme,
  usernameField,
  validation,
  isLoading,
  error,
  setError,
  prefillUsername,
  onUsernameChange,
  onUsernameFocus,
  onUsernameClear,
  onSubmit,
  onKeyDown,
  onInitOtp,
  smsState,
  authenticationStep,
  setAuthenticationStep,
  waitingForConfirmation,
  changeWallet,
  setChangeWallet,
  authOptions,
  authMethod,
  submitButtonRef,
  isDropdownOpen,
  onDropdownOpenChange,
  isSlot,
  webauthnPopup,
}: CreateControllerViewProps) {
  const onClose = useCallback(
    (authenticationMode?: AuthOption) => {
      setAuthenticationStep(
        authenticationMode === "password"
          ? AuthenticationStep.PasswordForm
          : authenticationMode === "sms"
            ? AuthenticationStep.SmsForm
            : AuthenticationStep.FillForm,
      );
    },
    [setAuthenticationStep],
  );

  useEffect(() => {
    if (isLoading) {
      setAuthenticationStep(AuthenticationStep.Pending);
    }
  }, [isLoading, setAuthenticationStep]);

  useEffect(() => {
    if (error && !!authMethod) {
      setAuthenticationStep(AuthenticationStep.Error);
    }
  }, [error, authMethod, setAuthenticationStep]);

  const onClosePending = useCallback(() => {
    setAuthenticationStep(AuthenticationStep.FillForm);
    if (authenticationStep === AuthenticationStep.Error) {
      setError(undefined);
    }
  }, [authenticationStep, setAuthenticationStep, setError]);

  const isLogin = !!validation.exists;

  const canRetry = useMemo(() => {
    if (changeWallet) {
      return false;
    }
    return (
      smsState != null ||
      (authMethod === "password" && isLogin) ||
      authMethod === "google" ||
      authMethod === "discord" ||
      authMethod === "metamask" ||
      authMethod === "phantom-evm" ||
      authMethod === "rabby" ||
      authMethod === "walletconnect"
    );
  }, [isLogin, authMethod, smsState, changeWallet]);

  const handleRetry = useCallback(() => {
    setError(undefined);
    if (smsState != null) {
      setAuthenticationStep(AuthenticationStep.SmsForm);
    } else if (authMethod === "password") {
      setAuthenticationStep(AuthenticationStep.PasswordForm);
    } else {
      onSubmit(authMethod);
    }
  }, [authMethod, smsState, setError, setAuthenticationStep, onSubmit]);

  // Handles scroll to top on mobile when keyboard opens
  const { isMobile } = useDevice();
  useEffect(() => {
    if (!isMobile || authenticationStep !== AuthenticationStep.FillForm) {
      return;
    }
    const handleScroll = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobile, authenticationStep]);

  return (
    <>
      <LayoutContainer>
        <CreateControllerForm
          theme={theme}
          usernameField={usernameField}
          validation={validation}
          isLoading={isLoading}
          error={error}
          setError={setError}
          prefillUsername={prefillUsername}
          onUsernameChange={onUsernameChange}
          onUsernameFocus={onUsernameFocus}
          onUsernameClear={onUsernameClear}
          onSubmit={onSubmit}
          onKeyDown={onKeyDown}
          waitingForConfirmation={waitingForConfirmation}
          authenticationStep={authenticationStep}
          submitButtonRef={submitButtonRef}
          isDropdownOpen={isDropdownOpen}
          onDropdownOpenChange={onDropdownOpenChange}
          authOptions={authOptions}
          isSlot={isSlot}
          webauthnPopup={webauthnPopup}
        />
      </LayoutContainer>
      <ChooseSignupMethodForm
        isOpen={authenticationStep === AuthenticationStep.ChooseMethod}
        isLoading={isLoading}
        validation={validation}
        username={usernameField.value}
        onClose={onClose}
        onSubmit={onSubmit}
        authOptions={authOptions}
      />
      <PasswordFormDrawer
        isOpen={authenticationStep === AuthenticationStep.PasswordForm}
        isLoading={isLoading}
        isLogin={isLogin}
        onClose={onClose}
        onSubmit={onSubmit}
      />
      <SmsOtpDrawer
        isOpen={authenticationStep === AuthenticationStep.SmsForm}
        isLogin={isLogin}
        onClose={onClose}
        onInitOtp={onInitOtp}
        onSubmit={onSubmit}
        smsState={smsState}
      />
      <SignerPendingDrawer
        isOpen={
          authenticationStep === AuthenticationStep.Pending ||
          authenticationStep === AuthenticationStep.Error
        }
        isLoading={isLoading}
        error={error}
        authenticationMode={smsState != null ? "sms" : authMethod}
        onClose={onClosePending}
        onRetry={canRetry ? handleRetry : undefined}
      >
        <ChangeWallet
          validation={validation}
          changeWallet={changeWallet}
          setChangeWallet={setChangeWallet}
          authMethod={authMethod}
        />
      </SignerPendingDrawer>
    </>
  );
}

export function CreateController({
  isSlot,
  signers,
  prefillUsername,
  isLoading: externalIsLoading = false,
  forcedAuthMethod,
  forcedAction,
}: {
  isSlot?: boolean;
  error?: Error;
  signers?: AuthOptions;
  prefillUsername?: string;
  isLoading?: boolean;
  forcedAuthMethod?: AuthOption;
  forcedAction?: "signup" | "login";
}) {
  const theme = useControllerTheme();
  const pendingSubmitRef = useRef(false);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const [usernameField, setUsernameField] = useState({
    value: prefillUsername ?? "",
    error: undefined,
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Debounce validation quickly to reduce latency
  const { debouncedValue: validationUsername } = useDebounce(
    usernameField.value,
    25,
  );

  const validation = useUsernameValidation(validationUsername);
  const { debouncedValue: debouncedValidation } = useDebounce(validation, 200);

  const {
    isLoading: internalIsLoading,
    error,
    setError,
    handleSubmit,
    handleInitOtp,
    smsState,
    authenticationStep,
    setAuthenticationStep,
    waitingForConfirmation,
    changeWallet,
    setChangeWallet,
    signupOptions,
    authMethod,
    setAuthMethod,
  } = useCreateController({
    isSlot,
    signers,
  });

  const signupSessionIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (signupSessionIdRef.current) return;
    signupSessionIdRef.current = crypto.randomUUID();
    posthog.register({ signup_session_id: signupSessionIdRef.current });
  }, []);

  const [
    {
      isInApp: isAnalyticsInApp,
      appKey: analyticsAppKey,
      appName: analyticsAppName,
    },
  ] = useState(() => InAppSpy());
  const isAnalyticsInAppBrowser = isAnalyticsInApp && !!analyticsAppKey;
  const { isMobile: isAnalyticsMobile } = useDevice();

  const pageViewedRef = useRef(false);
  useEffect(() => {
    if (pageViewedRef.current) return;
    if (signupOptions.length === 0) return;
    pageViewedRef.current = true;
    captureAnalyticsEvent(posthog, "signup_page_viewed", {
      forced_action: forcedAction,
      forced_auth_method: forcedAuthMethod,
      prefill_username: !!prefillUsername,
      is_in_app_browser: isAnalyticsInAppBrowser,
      in_app_browser_name: analyticsAppName ?? undefined,
      is_mobile: isAnalyticsMobile,
      is_safari: isSafari(navigator.userAgent),
      theme_verified: !!theme.verified,
      signup_options: signupOptions,
    });
  }, [
    signupOptions,
    forcedAction,
    forcedAuthMethod,
    prefillUsername,
    isAnalyticsInAppBrowser,
    analyticsAppName,
    isAnalyticsMobile,
    theme.verified,
  ]);

  // Combine internal and external loading states
  const isLoading = internalIsLoading || externalIsLoading;

  const { webauthnPopup } = useConnection();

  const handleFormSubmit = useCallback(
    (authenticationMode?: AuthOption, password?: string) => {
      // Don't submit if dropdown is open - let dropdown handle the Enter key
      if (isDropdownOpen) {
        return;
      }

      if (!usernameField.value) {
        return;
      }

      if (validation.status === "validating") {
        pendingSubmitRef.current = true;
        return;
      }

      if (validation.status === "valid") {
        const accountExists =
          forcedAction === "signup"
            ? false
            : forcedAction === "login"
              ? true
              : !!validation.exists;
        const selectedAuthenticationMode =
          authenticationMode ?? forcedAuthMethod;

        if (forcedAction === "signup" && validation.exists) {
          setError(new Error("Username already exists"));
          return;
        }

        if (forcedAction === "login" && !validation.exists) {
          setError(new Error("Account not found"));
          return;
        }

        if (
          selectedAuthenticationMode === undefined &&
          validation.signers &&
          allUseSameAuth(validation.signers) &&
          credentialToAuth(validation.signers[0]) === "password"
        ) {
          setAuthenticationStep(AuthenticationStep.PasswordForm);
          setError(undefined);
          return;
        }

        if (
          selectedAuthenticationMode === undefined &&
          validation.signers &&
          allUseSameAuth(validation.signers) &&
          credentialToAuth(validation.signers[0]) === "sms"
        ) {
          setAuthenticationStep(AuthenticationStep.SmsForm);
          setError(undefined);
          return;
        }

        if (
          selectedAuthenticationMode === undefined &&
          validation.signers &&
          validation.signers.length > 1 &&
          !allUseSameAuth(validation.signers)
        ) {
          setAuthenticationStep(AuthenticationStep.ChooseMethod);
          return;
        }

        if (
          selectedAuthenticationMode === undefined &&
          !accountExists &&
          signupOptions.length > 1
        ) {
          setAuthenticationStep(AuthenticationStep.ChooseMethod);
          return;
        }
        const authenticationMethod =
          signupOptions.length === 1 && !accountExists
            ? signupOptions[0]
            : validation.signers &&
                (validation.signers.length == 1 ||
                  allUseSameAuth(validation.signers))
              ? credentialToAuth(validation.signers[0])
              : selectedAuthenticationMode;

        // If password auth is detected and no password provided, show the auth method selection
        // which will trigger the password form
        if (authenticationMethod === "password" && !password) {
          setAuthenticationStep(AuthenticationStep.ChooseMethod);
          return;
        }

        // If SMS auth is detected and no OTP code provided, open the SMS drawer
        if (authenticationMethod === "sms" && !password) {
          setAuthenticationStep(AuthenticationStep.SmsForm);
          setError(undefined);
          return;
        }

        handleSubmit(
          usernameField.value.trim(),
          accountExists,
          authenticationMethod,
          password,
        );
      }
    },
    [
      isDropdownOpen,
      handleSubmit,
      usernameField.value,
      validation.exists,
      validation.status,
      validation.signers,
      setAuthenticationStep,
      signupOptions,
      forcedAuthMethod,
      forcedAction,
      setError,
    ],
  );

  useEffect(() => {
    if (
      pendingSubmitRef.current &&
      debouncedValidation.status === "valid" &&
      authenticationStep === AuthenticationStep.FillForm
    ) {
      pendingSubmitRef.current = false;
      handleFormSubmit();
    }
  }, [debouncedValidation.status, handleFormSubmit, authenticationStep]);

  const handleUsernameChange = (value: string) => {
    if (prefillUsername) return;
    setError(undefined);
    setUsernameField((u) => ({
      ...u,
      value,
      error: undefined,
    }));
  };

  const handleUsernameFocus = () => {};

  const handleUsernameClear = () => {
    if (prefillUsername) return;
    setError(undefined);
    setUsernameField((u) => ({ ...u, value: "" }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (validation.status !== "valid") return;

    if (e.key === "Enter") {
      // Don't submit if dropdown is open - let dropdown handle the Enter key
      if (isDropdownOpen) {
        return;
      }
      e.preventDefault();
      handleFormSubmit();
    }
  };

  // Handle keyboard shortcuts for Enter/Space to submit
  const canSubmit = useMemo(() => {
    return (
      validation.status === "valid" &&
      !isLoading &&
      usernameField.value.trim() !== ""
    );
  }, [validation.status, isLoading, usernameField.value]);

  useEffect(() => {
    const handleDocumentKeyDown = (e: KeyboardEvent) => {
      // Only handle if not in an input/textarea/contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Don't submit if in the ChooseMethod step
      if (authenticationStep === AuthenticationStep.ChooseMethod) {
        return;
      }

      // Don't submit if dropdown is open or submit is temporarily disabled
      if (isDropdownOpen) {
        return;
      }

      if ((e.key === "Enter" || e.key === " ") && canSubmit) {
        e.preventDefault();
        submitButtonRef.current?.click();
      }
    };

    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => document.removeEventListener("keydown", handleDocumentKeyDown);
  }, [
    canSubmit,
    authenticationStep,
    isDropdownOpen,
    setAuthMethod,
    handleFormSubmit,
  ]);

  // Reset authMethod and pendingSubmit when sheet is closed
  useEffect(() => {
    if (authenticationStep === AuthenticationStep.FillForm) {
      setAuthMethod(undefined);
      pendingSubmitRef.current = false;
    }
  }, [authenticationStep, setAuthMethod]);

  return (
    <>
      <CreateControllerView
        theme={theme}
        usernameField={usernameField}
        validation={debouncedValidation}
        isLoading={isLoading}
        error={error}
        setError={setError}
        prefillUsername={prefillUsername}
        isSlot={isSlot}
        onUsernameChange={handleUsernameChange}
        onUsernameFocus={handleUsernameFocus}
        onUsernameClear={handleUsernameClear}
        onSubmit={handleFormSubmit}
        onKeyDown={handleKeyDown}
        onInitOtp={handleInitOtp}
        smsState={smsState}
        authenticationStep={authenticationStep}
        setAuthenticationStep={setAuthenticationStep}
        waitingForConfirmation={waitingForConfirmation}
        changeWallet={changeWallet}
        setChangeWallet={setChangeWallet}
        authOptions={signupOptions}
        authMethod={authMethod}
        submitButtonRef={submitButtonRef}
        isDropdownOpen={isDropdownOpen}
        onDropdownOpenChange={setIsDropdownOpen}
        webauthnPopup={webauthnPopup}
      />
    </>
  );
}

export function CartridgeFooter() {
  return (
    <div className="flex flex-col">
      <a
        href="https://cartridge.gg"
        target="_blank"
        className="h-10 flex items-center justify-center gap-1 text-foreground-400 hover:text-primary transition-colors focus:outline-none focus:text-primary"
        tabIndex={-1}
      >
        <ControllerIcon />
        <div className="text-xs font-medium">by</div>
        <CartridgeLogo />
      </a>
    </div>
  );
}
