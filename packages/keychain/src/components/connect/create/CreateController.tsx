import { NavigationHeader } from "@/components";
import { ErrorAlert } from "@/components/ErrorAlert";
import { VerifiableControllerTheme } from "@/components/provider/connection";
import { usePostHog } from "@/components/provider/posthog";
import { useControllerTheme } from "@/hooks/connection";
import { useDebounce } from "@/hooks/debounce";
import { allUseSameAuth } from "@/utils/controller";
import { AuthOption, AuthOptions } from "@cartridge/controller";
import {
  CartridgeLogo,
  ControllerIcon,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  Sheet,
} from "@cartridge/ui";
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
import { AccountSearchResult } from "@/hooks/account";

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
}

type CreateControllerFormProps = Omit<
  CreateControllerViewProps,
  "setAuthenticationStep" | "authOptions"
>;

function CreateControllerForm({
  theme,
  usernameField,
  validation,
  isLoading,
  error,
  onUsernameChange,
  onUsernameFocus,
  onUsernameClear,
  onKeyDown,
  onSubmit,
  waitingForConfirmation,
  changeWallet,
  setChangeWallet,
  authMethod,
  authenticationStep,
  submitButtonRef,
  isDropdownOpen,
  onDropdownOpenChange,
}: CreateControllerFormProps) {
  const [{ isInApp, appKey, appName }] = useState(() => InAppSpy());

  // appKey is undefined for unknown applications which we're
  // assuming are dojo applications which implement AASA and
  // support using passkeys in the inapp browser.
  // https://docs.cartridge.gg/controller/presets#apple-app-site-association
  const isInAppBrowser = isInApp && !!appKey;

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
      />

      <form
        className="flex flex-col flex-1 overflow-y-scroll"
        style={{ scrollbarWidth: "none" }}
        onSubmit={(e) => {
          e.preventDefault();
          // Don't submit if dropdown is open
          if (isDropdownOpen) {
            return;
          }
          onSubmit();
        }}
      >
        <LayoutContent className="overflow-y-hidden">
          <CreateAccount
            usernameField={usernameField}
            validation={validation}
            error={error}
            isLoading={isLoading}
            onUsernameChange={onUsernameChange}
            onUsernameFocus={onUsernameFocus}
            onUsernameClear={onUsernameClear}
            onKeyDown={onKeyDown}
            showAutocomplete={true}
            selectedAccount={selectedAccount}
            onAccountSelect={handleAccountSelect}
            onSelectedUsernameRemove={handleRemovePill}
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
            authMethod={authMethod}
          />

          <AuthButton
            ref={submitButtonRef}
            type="submit"
            isLoading={isLoading}
            disabled={
              validation.status !== "valid" ||
              authenticationStep === AuthenticationStep.ChooseMethod ||
              isDropdownOpen
            }
            data-testid="submit-button"
            validation={validation}
            waitingForConfirmation={waitingForConfirmation}
            username={usernameField.value}
          />

          <CartridgeFooter />
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
  authOptions,
  authMethod,
  submitButtonRef,
  isDropdownOpen,
  onDropdownOpenChange,
}: CreateControllerViewProps) {
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setAuthenticationStep(AuthenticationStep.FillForm);
    }
  };

  return (
    <LayoutContainer>
      <Sheet
        open={authenticationStep === AuthenticationStep.ChooseMethod}
        onOpenChange={handleOpenChange}
      >
        <CreateControllerForm
          theme={theme}
          usernameField={usernameField}
          validation={validation}
          isLoading={isLoading}
          error={error}
          onUsernameChange={onUsernameChange}
          onUsernameFocus={onUsernameFocus}
          onUsernameClear={onUsernameClear}
          onSubmit={onSubmit}
          onKeyDown={onKeyDown}
          waitingForConfirmation={waitingForConfirmation}
          changeWallet={changeWallet}
          setChangeWallet={setChangeWallet}
          authMethod={authMethod}
          authenticationStep={authenticationStep}
          submitButtonRef={submitButtonRef}
          isDropdownOpen={isDropdownOpen}
          onDropdownOpenChange={onDropdownOpenChange}
        />
        <ChooseSignupMethodForm
          isLoading={isLoading}
          validation={validation}
          onSubmit={onSubmit}
          authOptions={authOptions}
          isOpen={authenticationStep === AuthenticationStep.ChooseMethod}
        />
      </Sheet>
    </LayoutContainer>
  );
}

export function CreateController({
  isSlot,
  signers,
}: {
  isSlot?: boolean;
  error?: Error;
  signers?: AuthOptions;
}) {
  const posthog = usePostHog();
  const hasLoggedFocus = useRef(false);
  const hasLoggedChange = useRef(false);
  const theme = useControllerTheme();
  const pendingSubmitRef = useRef(false);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const [usernameField, setUsernameField] = useState({
    value: "",
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
    authMethod,
    setAuthMethod,
  } = useCreateController({
    isSlot,
    signers,
  });

  const handleFormSubmit = useCallback(
    (authenticationMode?: AuthOption, password?: string) => {
      console.log(authenticationMode);
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
        const accountExists = !!validation.exists;

        if (
          authenticationMode === undefined &&
          validation.signers &&
          validation.signers.length > 1 &&
          !allUseSameAuth(validation.signers)
        ) {
          setAuthenticationStep(AuthenticationStep.ChooseMethod);
          return;
        }

        if (
          authenticationMode === undefined &&
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
              : authenticationMode;

        // If password auth is detected and no password provided, show the auth method selection
        // which will trigger the password form
        if (authenticationMethod === "password" && !password) {
          setAuthenticationStep(AuthenticationStep.ChooseMethod);
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
        console.log("trigger here");
        submitButtonRef.current?.click();
        handleFormSubmit();
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
        authOptions={signupOptions}
        authMethod={authMethod}
        submitButtonRef={submitButtonRef}
        isDropdownOpen={isDropdownOpen}
        onDropdownOpenChange={setIsDropdownOpen}
      />
      {overlay}
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
