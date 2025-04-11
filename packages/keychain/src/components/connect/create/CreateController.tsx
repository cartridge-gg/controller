import { ErrorAlert } from "@/components/ErrorAlert";
import { VerifiableControllerTheme } from "@/components/provider/connection";
import { usePostHog } from "@/components/provider/posthog";
import { useControllerTheme } from "@/hooks/connection";
import { useDebounce } from "@/hooks/debounce";
import {
  Button,
  CreateAccount,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
} from "@cartridge/ui-next";
import InAppSpy from "inapp-spy";
import { useCallback, useEffect, useRef, useState } from "react";
import { LoginMode, SignupMode } from "../types";
import { ChooseSignupMethod } from "./ChooseSignupMethod";
import { Legal } from "./Legal";
import { useCreateController } from "./useCreateController";
import { useUsernameValidation } from "./useUsernameValidation";

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
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isInAppBrowser?: boolean;
  isSlot?: boolean;
  handleLogin: (username: string) => void;
  handleSignup: (username: string, signupMethod: SignupMode) => void;
}

interface CreateControllerFormProps extends CreateControllerViewProps {
  setSelectSignupMethod: (value: boolean) => void;
}

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
  handleLogin,
  setSelectSignupMethod,
}: CreateControllerFormProps) {
  const isLogin = validation.exists || !usernameField.value;
  return (
    <>
      <LayoutHeader
        variant="expanded"
        title={
          theme.name.toLowerCase() === "cartridge"
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
        }}
      >
        <LayoutContent className="gap-6">
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
              isExpanded
            />
          )}

          {!theme.verified && (
            <ErrorAlert
              title="Please proceed with caution"
              description="Application domain does not match the configured domain."
              variant="error"
              isExpanded
            />
          )}

          <Button
            onClick={(e) => {
              e.preventDefault();
              if (isLogin) {
                handleLogin(usernameField.value);
              } else {
                setSelectSignupMethod(true);
              }
            }}
            type="submit"
            isLoading={isLoading}
            disabled={validation.status !== "valid"}
            data-testid="submit-button"
          >
            {isLogin ? "log in" : "sign up"}
          </Button>
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
  isInAppBrowser,
  isSlot,
  onUsernameChange,
  onUsernameFocus,
  onUsernameClear,
  onSubmit,
  onKeyDown,
  handleLogin,
  handleSignup,
}: CreateControllerViewProps) {
  const [selectSignupMethod, setSelectSignupMethod] = useState<boolean>(false);

  return (
    <LayoutContainer>
      {!selectSignupMethod && (
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
          handleLogin={handleLogin}
          handleSignup={handleSignup}
          setSelectSignupMethod={setSelectSignupMethod}
        />
      )}
      {selectSignupMethod && (
        <ChooseSignupMethod
          usernameField={usernameField}
          isSlot={isSlot}
          isLoading={isLoading}
          handleSignup={handleSignup}
          setSelectSignupMethod={setSelectSignupMethod}
        />
      )}
    </LayoutContainer>
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
    handleLogin,
    handleSignup,
  } = useCreateController({
    isSlot,
    loginMode,
  });

  const handleFormSubmit = useCallback(() => {
    if (!usernameField.value) {
      return;
    }

    if (validation.status === "validating") {
      pendingSubmitRef.current = true;
      return;
    }

    if (validation.status === "valid") {
      handleSubmit(usernameField.value, !!validation.exists);
    }
  }, [handleSubmit, usernameField.value, validation.exists, validation.status]);

  useEffect(() => {
    if (pendingSubmitRef.current && debouncedValidation.status === "valid") {
      pendingSubmitRef.current = false;
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
      handleFormSubmit();
    }
  };

  return (
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
      handleLogin={handleLogin}
      handleSignup={handleSignup}
    />
  );
}
