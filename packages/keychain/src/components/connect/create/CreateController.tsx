import { useRef, useState, useEffect } from "react";
import { Container, Footer, Content } from "@/components/layout";
import { Button, cn } from "@cartridge/ui-next";
import { useControllerTheme } from "@/hooks/theme";
import { usePostHog } from "posthog-js/react";
import { useDebounce } from "@/hooks/debounce";
import { useUsernameValidation } from "./useUsernameValidation";
import { LoginMode } from "../types";
import { Legal, StatusTray } from ".";
import { useCreateController } from "./useCreateController";
import { Input } from "@cartridge/ui-next";
import { ErrorAlert } from "@/components/ErrorAlert";
import { VerifiableControllerTheme } from "@/context/theme";
import InAppSpy from "inapp-spy";

interface CreateControllerViewProps {
  theme: VerifiableControllerTheme;
  usernameField: {
    value: string;
    error?: string;
  };
  validation: ReturnType<typeof useUsernameValidation>;
  isLoading: boolean;
  error?: Error;
  onUsernameChange: (value: string) => void;
  onUsernameFocus: () => void;
  onUsernameClear: () => void;
  onSubmit: () => void;
  isInAppBrowser?: boolean;
}

export function CreateControllerView({
  theme,
  usernameField,
  validation,
  isLoading,
  error,
  isInAppBrowser,
  onUsernameChange,
  onUsernameFocus,
  onUsernameClear,
  onSubmit,
}: CreateControllerViewProps) {
  return (
    <Container
      variant="expanded"
      title={
        theme.name === "cartridge"
          ? "Play with Controller"
          : `Play ${theme.name}`
      }
      description="Connect your Controller"
      hideNetwork
    >
      <form
        style={{ width: "100%" }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
      >
        <Content mb="2rem" gap={0}>
          <div
            className={cn(
              "border-[#E46958] rounded",
              validation.status === "invalid" || error ? "border" : undefined,
            )}
          >
            <Input
              {...usernameField}
              autoFocus
              placeholder="shinobi"
              onFocus={onUsernameFocus}
              onChange={(e) => {
                onUsernameChange(e.target.value.toLowerCase());
              }}
              isLoading={validation.status === "validating"}
              disabled={isLoading}
              onClear={onUsernameClear}
              style={{ position: "relative", zIndex: 1 }}
            />
          </div>

          <StatusTray
            username={usernameField.value}
            validation={validation}
            error={error}
          />
        </Content>

        <Footer showCatridgeLogo>
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
            isLoading={isLoading}
            disabled={validation.status !== "valid"}
            onClick={onSubmit}
          >
            {validation.exists ? "login" : "sign up"}
          </Button>
        </Footer>
      </form>
    </Container>
  );
}

function getNativeBrowserUrl() {
  // iOS: Open in Safari
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    return `x-safari-${window.location.href}`;
  }
  // Android: Open in Chrome
  if (/Android/.test(navigator.userAgent)) {
    return `intent:${window.location.href}#Intent;scheme=https;package=com.android.chrome;end`;
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

  const [usernameField, setUsernameField] = useState({
    value: "",
    error: undefined,
  });

  const { debouncedValue: username } = useDebounce(usernameField.value, 100);
  const validation = useUsernameValidation(username);

  const { isLoading, error, setError, handleSubmit } = useCreateController({
    onCreated,
    isSlot,
    loginMode,
  });

  const [{ isInApp }] = useState(() => InAppSpy());

  useEffect(() => {
    if (isInApp) {
      const nativeBrowserUrl = getNativeBrowserUrl();
      if (nativeBrowserUrl) {
        // Try to open in native browser
        window.location.href = nativeBrowserUrl;
      }
    }
  }, []);

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

  const handleFormSubmit = () => {
    if (!usernameField.value) {
      return;
    }
    handleSubmit(usernameField.value, !!validation.exists);
  };

  return (
    <CreateControllerView
      theme={theme}
      usernameField={usernameField}
      validation={validation}
      isLoading={isLoading}
      error={error}
      isInAppBrowser={isInApp}
      onUsernameChange={handleUsernameChange}
      onUsernameFocus={handleUsernameFocus}
      onUsernameClear={handleUsernameClear}
      onSubmit={handleFormSubmit}
    />
  );
}
