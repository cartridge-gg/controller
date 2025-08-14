import { AuthOption } from "@cartridge/controller";
import { Button, Input, SheetContent, SheetTitle } from "@cartridge/ui";
import { useEffect, useMemo, useState } from "react";
import { SignupButton } from "../buttons/signup-button";
import { credentialToAuth } from "../types";
import { useUsernameValidation } from "./useUsernameValidation";

interface ChooseSignupMethodProps {
  isLoading: boolean;
  validation: ReturnType<typeof useUsernameValidation>;
  onSubmit: (authenticationMode?: AuthOption) => void;
  authOptions: AuthOption[];
}

export function ChooseSignupMethodForm({
  isLoading,
  validation,
  onSubmit,
  authOptions,
}: ChooseSignupMethodProps) {
  const [selectedAuth, setSelectedAuth] = useState<AuthOption | undefined>(
    undefined,
  );
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const options = useMemo(() => {
    if (validation.signers?.length) {
      return Array.from(
        new Set(
          validation.signers
            .map((signer) => credentialToAuth(signer))
            .filter(Boolean),
        ),
      ) as AuthOption[];
    } else {
      return authOptions;
    }
  }, [validation.signers, authOptions]);

  useEffect(() => {
    if (!isLoading) {
      setSelectedAuth(undefined);
    }
  }, [isLoading]);

  const handleInteractOutside = (
    event: CustomEvent<{ originalEvent: Event }>,
  ) => {
    const overlayElement = document.getElementById("wallet-connect-overlay");
    if (overlayElement && overlayElement.contains(event.target as Node)) {
      event.preventDefault();
    }
  };

  const handleSelectedOption = (
    e:
      | React.KeyboardEvent<HTMLButtonElement>
      | React.MouseEvent<HTMLButtonElement>,
    option: AuthOption,
  ) => {
    if (
      e.type === "keydown" &&
      (e as React.KeyboardEvent<HTMLButtonElement>).key !== "Enter"
    ) {
      return;
    }
    e.preventDefault();

    if (option === "password") {
      setShowPasswordInput(true);
      setSelectedAuth(option);
      setPassword("");
      setConfirmPassword("");
      setPasswordError(null);
    } else {
      setSelectedAuth(option);
      onSubmit(option);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    const isSignup = !validation.exists;
    if (isSignup && password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    // Store password in sessionStorage temporarily for the auth flow
    sessionStorage.setItem("temp_password", password);
    sessionStorage.setItem("temp_password_mode", isSignup ? "signup" : "login");

    onSubmit("password");
  };

  const handlePasswordCancel = () => {
    setShowPasswordInput(false);
    setSelectedAuth(undefined);
    setPassword("");
    setConfirmPassword("");
    setPasswordError(null);
  };

  return (
    <SheetContent
      side="bottom"
      className="absolute flex flex-col bg-spacer-100 w-fill h-fit justify-end p-6 gap-4 border-t-0 rounded-tl-[16px] rounded-tr-[16px]"
      showClose={false}
      portal={false}
      onInteractOutside={handleInteractOutside}
    >
      <SheetTitle className="hidden"></SheetTitle>
      {showPasswordInput ? (
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">
              {validation.exists ? "Login" : "Create Account"} with Password
            </h3>
            <p className="text-sm text-muted-foreground">
              ⚠️ Testing only - Password cannot be recovered if lost
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (min. 8 characters)"
              autoComplete={
                validation.exists ? "current-password" : "new-password"
              }
              disabled={isLoading}
            />
          </div>

          {!validation.exists && (
            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                autoComplete="new-password"
                disabled={isLoading}
              />
            </div>
          )}

          {passwordError && (
            <p className="text-sm text-destructive">{passwordError}</p>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handlePasswordCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Back
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading
                ? "Processing..."
                : validation.exists
                  ? "Login"
                  : "Create Account"}
            </Button>
          </div>
        </form>
      ) : (
        <>
          {options.includes("webauthn") && (
            <div className="border-b border-background-125 pb-4">
              <SignupButton
                authMethod="webauthn"
                className="justify-center"
                onClick={(e) => handleSelectedOption(e, "webauthn")}
                onKeyDown={(e) => handleSelectedOption(e, "webauthn")}
                disabled={isLoading && selectedAuth !== "webauthn"}
                isLoading={isLoading && selectedAuth === "webauthn"}
              />
            </div>
          )}
          <div className="flex flex-col gap-3">
            {options
              .filter((option) => option !== "webauthn")
              .map((option) => (
                <SignupButton
                  authMethod={option}
                  key={option}
                  className="justify-start"
                  onKeyDown={(e) => handleSelectedOption(e, option)}
                  onClick={(e) => handleSelectedOption(e, option)}
                  disabled={isLoading && selectedAuth !== option}
                  isLoading={isLoading && selectedAuth === option}
                />
              ))}
          </div>
        </>
      )}
    </SheetContent>
  );
}
