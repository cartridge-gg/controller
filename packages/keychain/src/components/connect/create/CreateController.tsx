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
import { AuthenticationMode, LoginMode } from "../types";
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
  onSubmit: (authenticationMode?: AuthenticationMode) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isInAppBrowser?: boolean;
  isSlot?: boolean;
  authenticationMode: AuthenticationMode | undefined;
  setAuthenticationMode: (value: AuthenticationMode | undefined) => void;
}

type CreateControllerFormProps = CreateControllerViewProps;

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
  setAuthenticationMode,
}: CreateControllerFormProps) {
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
          if (!import.meta.env.DEV) {
            onSubmit();
          } else {
            if (validation.exists) {
              onSubmit();
            } else {
              setAuthenticationMode(AuthenticationMode.None);
            }
          }
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
            type="submit"
            isLoading={isLoading}
            disabled={validation.status !== "valid"}
            data-testid="submit-button"
          >
            {validation.exists || !usernameField.value ? "log in" : "sign up"}
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
  authenticationMode,
  setAuthenticationMode,
}: CreateControllerViewProps) {
  return (
    <LayoutContainer>
      {!authenticationMode &&
        authenticationMode !== AuthenticationMode.None && (
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
            authenticationMode={authenticationMode}
            setAuthenticationMode={setAuthenticationMode}
          />
        )}
      {authenticationMode !== null &&
        authenticationMode === AuthenticationMode.None && (
          <ChooseSignupMethod
            isSlot={isSlot}
            isLoading={isLoading}
            onSubmit={onSubmit}
            setAuthenticationMode={setAuthenticationMode}
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

  const [authenticationMode, setAuthenticationMode] = useState<
    AuthenticationMode | undefined
  >(undefined);

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

  const { isLoading, error, setError, handleSubmit } = useCreateController({
    isSlot,
    loginMode,
  });

  const handleFormSubmit = useCallback(
    (authenticationMode?: AuthenticationMode) => {
      if (!usernameField.value) {
        return;
      }

      if (validation.status === "validating") {
        pendingSubmitRef.current = true;
        return;
      }

      if (validation.status === "valid") {
        handleSubmit(
          usernameField.value,
          !!validation.exists,
          authenticationMode,
        );
      }
    },
    [handleSubmit, usernameField.value, validation.exists, validation.status],
  );

  useEffect(() => {
    if (pendingSubmitRef.current && debouncedValidation.status === "valid") {
      pendingSubmitRef.current = false;
      handleFormSubmit(authenticationMode);
    }
  }, [debouncedValidation.status, handleFormSubmit, authenticationMode]);

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
      handleFormSubmit(authenticationMode);
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
      authenticationMode={authenticationMode}
      setAuthenticationMode={setAuthenticationMode}
    />
  );
}
