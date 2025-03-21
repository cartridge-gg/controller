import { useRef, useState, useEffect, useCallback } from "react";
import {
  LayoutContainer,
  LayoutFooter,
  LayoutContent,
  Button,
  LayoutHeader,
  CreateAccount,
} from "@cartridge/ui-next";
import { useDebounce } from "@/hooks/debounce";
import { useUsernameValidation } from "./useUsernameValidation";
import { LoginMode } from "../types";
import { Legal } from "./Legal";
import { useCreateController } from "./useCreateController";
import { ErrorAlert } from "@/components/ErrorAlert";
import InAppSpy from "inapp-spy";
import { usePostHog } from "@/components/provider/posthog";
import { useConnection, useControllerTheme } from "@/hooks/connection";
import { VerifiableControllerTheme } from "@/components/provider/connection";

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
  onConnectPhantom: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isInAppBrowser?: boolean;
  isSlot?: boolean;
  connectingPhantom: boolean;
  phantomAvailable: boolean;
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
  onConnectPhantom,
  onKeyDown,
  connectingPhantom,
  phantomAvailable,
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
          {phantomAvailable && process.env.NODE_ENV === "never" && (
            <Button
              type="button"
              isLoading={connectingPhantom}
              onClick={onConnectPhantom}
              data-testid="solana-button"
              className="mt-2"
              disabled={!phantomAvailable}
            >
              Sign in with Solana
            </Button>
          )}
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
  const { externalWallets, externalSignIn } = useConnection();
  const [connectingPhantom, setConnectingPhantom] = useState(false);
  const [phantomAvailable, setPhantomAvailable] = useState(false);

  const [usernameField, setUsernameField] = useState({
    value: "",
    error: undefined,
  });

  // Check if Phantom wallet is available
  useEffect(() => {
    if (externalWallets) {
      const phantomWallet = externalWallets.find(
        (wallet) => wallet.type === "phantom",
      );
      setPhantomAvailable(!!phantomWallet?.available);
    } else {
      setPhantomAvailable(false);
    }
  }, [externalWallets]);

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

  const handleConnectPhantom = useCallback(async () => {
    setConnectingPhantom(true);
    try {
      posthog?.capture("Connect Phantom");
      const response = await externalSignIn("phantom", "0x1235");
      if (response.success) {
        // The user has connected their Phantom wallet
        console.log("Connected to Phantom wallet:", response);
      } else {
        setError(
          new Error(response.error || "Failed to connect Phantom wallet"),
        );
        posthog?.capture("Phantom Connection Failed", {
          error: response.error,
        });
      }
    } catch (error) {
      console.error("Error connecting to Phantom wallet:", error);
      setError(
        error instanceof Error
          ? error
          : new Error("Unknown error connecting to Phantom wallet"),
      );
      posthog?.capture("Phantom Connection Error", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setConnectingPhantom(false);
    }
  }, [
    externalSignIn,
    posthog,
    setError,
    usernameField.value,
    validation.status,
    handleFormSubmit,
    handleUsernameChange,
  ]);

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
      onConnectPhantom={handleConnectPhantom}
      onKeyDown={handleKeyDown}
      connectingPhantom={connectingPhantom}
      phantomAvailable={phantomAvailable}
    />
  );
}
