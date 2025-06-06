import { ErrorAlert } from "@/components/ErrorAlert";
import { VerifiableControllerTheme } from "@/components/provider/connection";
import { usePostHog } from "@/components/provider/posthog";
import { useControllerTheme } from "@/hooks/connection";
import { useDebounce } from "@/hooks/debounce";
import { AuthOption } from "@cartridge/controller";
import {
  CreateAccount,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  Sheet,
} from "@cartridge/ui";
import InAppSpy from "inapp-spy";
import { useCallback, useEffect, useRef, useState } from "react";
import { AuthButton } from "../buttons/auth-button";
import { ChangeWallet } from "../buttons/change-wallet";
import { getControllerSignerProvider, LoginMode } from "../types";
import { ChooseSignupMethodForm } from "./ChooseSignupMethodForm";
import { Legal } from "./Legal";
import { useCreateController } from "./useCreateController";
import { useUsernameValidation } from "./useUsernameValidation";
import { AuthenticationStep } from "./utils";

interface CreateControllerViewProps {
  theme: VerifiableControllerTheme;
  usernameField: {
    value: string;
    error?: Error;
  };
  validation: ReturnType<typeof useUsernameValidation>;
  isLoading: boolean;
  error?: Error;
  onUsernameChange: (value: string) => void;
  onUsernameFocus: () => void;
  onUsernameClear: () => void;
  onSubmit: (authenticationMode?: AuthOption) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isInAppBrowser?: boolean;
  isSlot?: boolean;
  authenticationStep: AuthenticationStep;
  setAuthenticationStep: (value: AuthenticationStep) => void;
  waitingForConfirmation: boolean;
  changeWallet: boolean;
  setChangeWallet: (value: boolean) => void;
  signupOptions: AuthOption[];
}

type CreateControllerFormProps = Omit<
  CreateControllerViewProps,
  "authenticationStep" | "setAuthenticationStep" | "signupOptions"
>;

function CreateControllerForm({
  theme,
  usernameField,
  validation,
  isLoading,
  error,
  isInAppBrowser,
  isSlot,
  onUsernameChange,
  onUsernameFocus,
  onUsernameClear,
  onKeyDown,
  onSubmit,
  waitingForConfirmation,
  changeWallet,
  setChangeWallet,
}: CreateControllerFormProps) {
  return (
    <LayoutContainer>
      <LayoutHeader
        variant="expanded"
        title={
          isSlot
            ? "Connect to Slot"
            : theme.name.toLowerCase() === "cartridge"
              ? "Connect Controller"
              : `Connect to ${theme.name}`
        }
        hideUsername
        hideNetwork={isSlot}
        hideSettings
      />

      <form
        className="flex flex-col flex-1 overflow-y-scroll"
        style={{ scrollbarWidth: "none" }}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(getControllerSignerProvider(validation.signer));
        }}
      >
        <LayoutContent className="gap-6 overflow-y-hidden">
          <CreateAccount
            usernameField={usernameField}
            validation={validation}
            error={error}
            isLoading={isLoading}
            onUsernameChange={onUsernameChange}
            onUsernameFocus={onUsernameFocus}
            onUsernameClear={onUsernameClear}
            onKeyDown={onKeyDown}
          />
          <Legal />
        </LayoutContent>

        <LayoutFooter showCatridgeLogo>
          {isInAppBrowser && (
            <ErrorAlert
              title="Browser not supported"
              description="Please open this page in your device's native browser (Safari/Chrome) to continue."
              variant="error"
              isExpanded={false}
            />
          )}

          {!theme.verified && (
            <ErrorAlert
              title="Please proceed with caution"
              isExpanded={false}
              description="Application domain does not match the configured domain."
              variant="error"
            />
          )}

          <ChangeWallet
            validation={validation}
            changeWallet={changeWallet}
            setChangeWallet={setChangeWallet}
          />

          <AuthButton
            type="submit"
            isLoading={isLoading}
            disabled={validation.status !== "valid"}
            data-testid="submit-button"
            validation={validation}
            waitingForConfirmation={waitingForConfirmation}
            username={usernameField.value}
          />
        </LayoutFooter>
      </form>
    </LayoutContainer>
  );
}
export function CreateControllerView({
  theme,
  usernameField,
  validation,
  isLoading,
  error,
  isInAppBrowser,
  isSlot,
  onUsernameChange,
  onUsernameFocus,
  onUsernameClear,
  onSubmit,
  onKeyDown,
  authenticationStep,
  setAuthenticationStep,
  waitingForConfirmation,
  changeWallet,
  setChangeWallet,
  signupOptions,
}: CreateControllerViewProps) {
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setAuthenticationStep(AuthenticationStep.FillForm);
    }
  };

  return (
    <Sheet
      open={authenticationStep === AuthenticationStep.ChooseSignupMethod}
      onOpenChange={handleOpenChange}
    >
      <CreateControllerForm
        theme={theme}
        usernameField={usernameField}
        validation={validation}
        isLoading={isLoading}
        error={error}
        isInAppBrowser={isInAppBrowser}
        isSlot={isSlot}
        onUsernameChange={onUsernameChange}
        onUsernameFocus={onUsernameFocus}
        onUsernameClear={onUsernameClear}
        onSubmit={onSubmit}
        onKeyDown={onKeyDown}
        waitingForConfirmation={waitingForConfirmation}
        changeWallet={changeWallet}
        setChangeWallet={setChangeWallet}
      />
      <ChooseSignupMethodForm
        isLoading={isLoading}
        onSubmit={onSubmit}
        signupOptions={signupOptions}
      />
    </Sheet>
  );
}

function getNativeBrowserUrl() {
  // iOS: Open in Safari
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    return `x-safari-${window.location.href}`;
  }
  // Android: Open in Chrome
  if (/Android/.test(navigator.userAgent)) {
    let currentUrl = window.location.href;
    currentUrl = currentUrl.replace(/^https?:\/\//, "");
    return `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
  }
  return null;
}

export function CreateController({
  isSlot,
  loginMode = LoginMode.Webauthn,
}: {
  isSlot?: boolean;
  loginMode?: LoginMode;
  error?: Error;
}) {
  const posthog = usePostHog();
  const hasLoggedFocus = useRef(false);
  const hasLoggedChange = useRef(false);
  const theme = useControllerTheme();
  const pendingSubmitRef = useRef(false);
  const newLoginFeatureEnabled = true;

  const [usernameField, setUsernameField] = useState({
    value: "",
    error: undefined,
  });

  // Debounce validation quickly to reduce latency
  const { debouncedValue: validationUsername } = useDebounce(
    usernameField.value,
    25,
  );

  const validation = useUsernameValidation(validationUsername);
  const { debouncedValue: debouncedValidation } = useDebounce(validation, 200);

  const {
    isLoading,
    error,
    setError,
    handleSubmit,
    authenticationStep,
    setAuthenticationStep,
    overlay,
    waitingForConfirmation,
    changeWallet,
    setChangeWallet,
    signupOptions,
  } = useCreateController({
    isSlot,
    loginMode,
  });

  const handleFormSubmit = useCallback(
    (authenticationMode?: AuthOption) => {
      if (!usernameField.value) {
        return;
      }

      if (validation.status === "validating") {
        pendingSubmitRef.current = true;
        return;
      }

      if (validation.status === "valid") {
        const accountExists = !!validation.exists;

        if (
          authenticationMode === undefined &&
          !accountExists &&
          newLoginFeatureEnabled &&
          signupOptions.length > 1
        ) {
          setAuthenticationStep(AuthenticationStep.ChooseSignupMethod);
          return;
        }

        handleSubmit(
          usernameField.value,
          accountExists,
          signupOptions.length === 1 && !accountExists
            ? signupOptions[0]
            : authenticationMode,
        );
      }
    },
    [
      handleSubmit,
      usernameField.value,
      validation.exists,
      validation.status,
      setAuthenticationStep,
      newLoginFeatureEnabled,
      signupOptions,
    ],
  );

  useEffect(() => {
    if (pendingSubmitRef.current && debouncedValidation.status === "valid") {
      handleFormSubmit();
    }
  }, [debouncedValidation.status, handleFormSubmit]);

  const [{ isInApp }] = useState(() => InAppSpy());

  useEffect(() => {
    if (isInApp) {
      const nativeBrowserUrl = getNativeBrowserUrl();
      if (nativeBrowserUrl) {
        // Try to open in native browser
        window.location.href = nativeBrowserUrl;
      }
    }
  }, [isInApp]);

  const handleUsernameChange = (value: string) => {
    if (!hasLoggedChange.current) {
      posthog?.capture("Change Username");
      hasLoggedChange.current = true;
    }
    setError(undefined);
    setUsernameField((u) => ({
      ...u,
      value,
      error: undefined,
    }));
  };

  const handleUsernameFocus = () => {
    if (!hasLoggedFocus.current) {
      posthog?.capture("Focus Username");
      hasLoggedFocus.current = true;
    }
  };

  const handleUsernameClear = () => {
    setError(undefined);
    setUsernameField((u) => ({ ...u, value: "" }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFormSubmit(getControllerSignerProvider(validation.signer));
    }
  };

  return (
    <>
      <CreateControllerView
        theme={theme}
        usernameField={usernameField}
        validation={debouncedValidation}
        isLoading={isLoading}
        error={error}
        isInAppBrowser={isInApp}
        isSlot={isSlot}
        onUsernameChange={handleUsernameChange}
        onUsernameFocus={handleUsernameFocus}
        onUsernameClear={handleUsernameClear}
        onSubmit={handleFormSubmit}
        onKeyDown={handleKeyDown}
        authenticationStep={authenticationStep}
        setAuthenticationStep={setAuthenticationStep}
        waitingForConfirmation={waitingForConfirmation}
        changeWallet={changeWallet}
        setChangeWallet={setChangeWallet}
        signupOptions={signupOptions}
      />
      {overlay}
    </>
  );
}
