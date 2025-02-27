import { useRef, useState, useEffect, useCallback } from "react";
import {
  LayoutContainer,
  LayoutFooter,
  LayoutContent,
  Button,
  LayoutHeader,
  CreateAccount,
} from "@cartridge/ui-next";
import { useDebounce } from "#hooks/debounce";
import { useUsernameValidation } from "./useUsernameValidation";
import { LoginMode } from "../types";
import { Legal } from "./Legal";
import { useCreateController } from "./useCreateController";
import { ErrorAlert } from "#components/ErrorAlert";
import InAppSpy from "inapp-spy";
import { usePostHog } from "#components/provider/posthog";
import { useControllerTheme } from "#hooks/connection";
import { VerifiableControllerTheme } from "#components/provider/connection";

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
}: CreateControllerViewProps) {
  return (
    <LayoutContainer>
      <LayoutHeader
        variant="expanded"
        title={
          theme.name === "cartridge"
            ? "Play with Controller"
            : `Play ${theme.name}`
        }
        description="Connect your Controller"
        hideUsername
        hideNetwork={isSlot}
        hideSettings
      />

      <form
        className="flex flex-col flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <LayoutContent className="gap-0">
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
        </LayoutContent>

        <LayoutFooter showCatridgeLogo>
          {isInAppBrowser && (
            <div className="mb-5">
              <ErrorAlert
                title="Browser not supported"
                description="Please open this page in your device's native browser (Safari/Chrome) to continue."
                variant="warning"
                isExpanded
              />
            </div>
          )}

          {!theme.verified && (
            <div className="mb-5">
              <ErrorAlert
                title="Please proceed with caution"
                description="Application domain does not match the configured domain."
                variant="warning"
                isExpanded
              />
            </div>
          )}

          <Legal />

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
  onCreated,
}: {
  isSlot?: boolean;
  loginMode?: LoginMode;
  onCreated?: () => void;
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

  const { isLoading, error, setError, handleSubmit } = useCreateController({
    onCreated,
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
    />
  );
}
