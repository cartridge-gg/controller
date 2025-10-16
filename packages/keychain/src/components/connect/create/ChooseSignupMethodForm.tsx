import { AuthOption } from "@cartridge/controller";
import { SheetContent, SheetTitle } from "@cartridge/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SignupButton } from "../buttons/signup-button";
import { credentialToAuth } from "../types";
import { useUsernameValidation } from "./useUsernameValidation";
import { PasswordForm } from "./password/PasswordForm";

interface ChooseSignupMethodProps {
  isLoading: boolean;
  validation: ReturnType<typeof useUsernameValidation>;
  onSubmit: (authenticationMode?: AuthOption, password?: string) => void;
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
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

  // Initialize button refs array
  useEffect(() => {
    buttonRefs.current = buttonRefs.current.slice(0, options.length);
  }, [options.length]);

  // Auto-focus first button when sheet opens
  useEffect(() => {
    if (!showPasswordInput && options.length > 0) {
      setHighlightedIndex(0);
      // Small delay to ensure the sheet is fully rendered
      const timer = setTimeout(() => {
        buttonRefs.current[0]?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showPasswordInput, options.length]);

  // Automatically show password form for login if password is the only option
  useEffect(() => {
    if (
      validation.exists &&
      options.length === 1 &&
      options[0] === "password"
    ) {
      setShowPasswordInput(true);
      setSelectedAuth("password");
    }
  }, [validation.exists, options]);

  useEffect(() => {
    if (!isLoading) {
      // Don't reset if we're showing password input
      if (!showPasswordInput) {
        setSelectedAuth(undefined);
      }
    }
  }, [isLoading, showPasswordInput]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (showPasswordInput || isLoading) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) => {
            const next = Math.min(prev + 1, options.length - 1);
            buttonRefs.current[next]?.focus();
            return next;
          });
          break;

        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => {
            const next = Math.max(prev - 1, 0);
            buttonRefs.current[next]?.focus();
            return next;
          });
          break;

        case " ":
        case "Enter":
          e.preventDefault();
          if (options[highlightedIndex]) {
            const option = options[highlightedIndex];
            if (option === "password") {
              setShowPasswordInput(true);
              setSelectedAuth(option);
            } else {
              setSelectedAuth(option);
              onSubmit(option);
            }
          }
          break;

        case "Escape":
          e.preventDefault();
          // Close the sheet by triggering parent's close handler
          break;
      }
    },
    [showPasswordInput, isLoading, options, highlightedIndex, onSubmit],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleInteractOutside = (
    event: CustomEvent<{ originalEvent: Event }>,
  ) => {
    const overlayElement = document.getElementById("wallet-connect-overlay");
    if (overlayElement && overlayElement.contains(event.target as Node)) {
      event.preventDefault();
    }
  };

  const handleSelectedOption = (
    e: React.MouseEvent | React.KeyboardEvent,
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
    } else {
      setSelectedAuth(option);
      onSubmit(option);
    }
  };

  const handlePasswordSubmit = (password: string) => {
    onSubmit("password", password);
  };

  const handlePasswordCancel = () => {
    setShowPasswordInput(false);
    setSelectedAuth(undefined);
  };

  return (
    <SheetContent
      side="bottom"
      className="absolute flex flex-col bg-spacer-100 w-fill h-fit justify-end p-6 gap-4 border-t-0 rounded-tl-[16px] rounded-tr-[16px]"
      showClose={false}
      portal={false}
      onInteractOutside={handleInteractOutside}
    >
      {showPasswordInput ? (
        <PasswordForm
          isLogin={!!validation.exists}
          isLoading={isLoading}
          onSubmit={handlePasswordSubmit}
          onCancel={handlePasswordCancel}
        />
      ) : (
        <>
          <SheetTitle className="text-lg text-start font-semibold">
            {validation.exists ? "Login" : "Choose your method"}
          </SheetTitle>
          {options.map((option, index) => {
            const isWebauthn = option === "webauthn";
            const isHighlighted = highlightedIndex === index;

            return (
              <div
                key={option}
                className={
                  isWebauthn
                    ? "border-b border-background-125 pb-4"
                    : index === 0 && !options.includes("webauthn")
                      ? ""
                      : "mt-3"
                }
              >
                <SignupButton
                  ref={(el) => {
                    buttonRefs.current[index] = el;
                  }}
                  authMethod={option}
                  className={isWebauthn ? "justify-center" : "justify-start"}
                  onClick={(e) => handleSelectedOption(e, option)}
                  disabled={isLoading && selectedAuth !== option}
                  isLoading={isLoading && selectedAuth === option}
                  data-highlighted={isHighlighted}
                  style={
                    isHighlighted && !isLoading
                      ? { outline: "2px solid rgba(255, 255, 255, 0.3)" }
                      : undefined
                  }
                />
              </div>
            );
          })}
        </>
      )}
    </SheetContent>
  );
}
