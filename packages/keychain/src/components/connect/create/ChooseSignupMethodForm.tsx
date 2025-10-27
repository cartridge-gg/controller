import { AuthOption } from "@cartridge/controller";
import { cn, SheetContent, SheetTitle } from "@cartridge/ui";
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
  isOpen?: boolean;
}

export function ChooseSignupMethodForm({
  isLoading,
  validation,
  onSubmit,
  authOptions,
  isOpen = true,
}: ChooseSignupMethodProps) {
  const [selectedAuth, setSelectedAuth] = useState<AuthOption | undefined>(
    undefined,
  );
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const options = useMemo(() => {
    let opts: AuthOption[];
    if (validation.signers?.length) {
      opts = Array.from(
        new Set(
          validation.signers
            .map((signer) => credentialToAuth(signer))
            .filter(Boolean),
        ),
      ) as AuthOption[];
    } else {
      opts = authOptions;
    }

    // Sort to ensure webauthn is first if it exists
    return opts.sort((a, b) => {
      if (a === "webauthn") return -1;
      if (b === "webauthn") return 1;
      return 0;
    });
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
      // Only handle keyboard events when the sheet is actually open
      if (!isOpen || showPasswordInput || isLoading) return;

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
    [isOpen, showPasswordInput, isLoading, options, highlightedIndex, onSubmit],
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
          <div className="flex flex-col gap-3">
            {options.map((option, index) => {
              const isWebauthn = option === "webauthn";
              const isHighlighted = highlightedIndex === index;
              const hasWebauthn = options.includes("webauthn");
              const isFirstAndWebauthn = index === 0 && isWebauthn;

              return (
                <div
                  key={option}
                  className={cn(
                    isFirstAndWebauthn &&
                      hasWebauthn &&
                      "border-b border-background-125 pb-4",
                  )}
                >
                  <SignupButton
                    ref={(el) => {
                      buttonRefs.current[index] = el;
                    }}
                    authMethod={option}
                    className={cn(
                      "ring-0 focus-visible:ring-0 ring-offset-0 focus-visible:ring-offset-0 outline-none",
                      isWebauthn ? "justify-center" : "justify-start",
                      isHighlighted &&
                        (isWebauthn ? "opacity-80" : "bg-background-300"),
                    )}
                    onClick={(e) => handleSelectedOption(e, option)}
                    onKeyDown={(e) => handleSelectedOption(e, option)}
                    disabled={isLoading && selectedAuth !== option}
                    isLoading={isLoading && selectedAuth === option}
                    data-highlighted={isHighlighted}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
    </SheetContent>
  );
}
