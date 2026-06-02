import {
  AuthOption,
  EXTERNAL_WALLETS,
  ExternalWalletType,
} from "@cartridge/controller";
import {
  AchievementPlayerAvatar,
  cn,
  Drawer,
  DrawerContent,
  PlusIcon,
  WalletIcon,
} from "@cartridge/controller-ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SignupButton } from "../buttons/signup-button";
import { credentialToAuth } from "../types";
import { useUsernameValidation } from "./useUsernameValidation";
import { useWallets } from "@/hooks/wallets";

export const INITIAL_OPTIONS: AuthOption[] = ["sms", "webauthn"];
export const WALLET_OPTIONS: AuthOption[] = [
  ...EXTERNAL_WALLETS,
  "walletconnect",
];

interface ChooseSignupMethodProps {
  isOpen?: boolean;
  isLoading: boolean;
  validation: ReturnType<typeof useUsernameValidation>;
  username?: string;
  onClose: (authenticationMode?: AuthOption) => void;
  onSubmit: (authenticationMode?: AuthOption) => void;
  authOptions: AuthOption[];
}

export function ChooseSignupMethodForm({
  isOpen = true,
  isLoading,
  validation,
  username,
  onSubmit,
  onClose,
  authOptions,
}: ChooseSignupMethodProps) {
  const { availableWallets } = useWallets();
  const [selectedAuth, setSelectedAuth] = useState<AuthOption | undefined>(
    undefined,
  );
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [mode, setMode] = useState<"initial" | "expanded" | "crypto">(
    "initial",
  );

  const isLogin = validation.exists;

  useEffect(() => {
    if (isOpen) {
      setMode("initial");
    }
  }, [isOpen, setMode]);

  const { options, hasOther, hasCrypto } = useMemo(() => {
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

    const hasOther = opts.some((opt) => !INITIAL_OPTIONS.includes(opt));
    const hasCrypto = opts.some((opt) => WALLET_OPTIONS.includes(opt));

    if (!isLogin) {
      switch (mode) {
        default:
        case "initial":
          opts = opts.filter((opt) => INITIAL_OPTIONS.includes(opt));
          break;
        case "expanded":
          opts = opts.filter((opt) => !WALLET_OPTIONS.includes(opt));
          break;
        case "crypto":
          opts = opts.filter((opt) => WALLET_OPTIONS.includes(opt));
          break;
      }
    }

    // Sort to ensure webauthn is first if it exists
    const options = opts.sort((a, b) => {
      const aIndex = INITIAL_OPTIONS.indexOf(a);
      const bIndex = INITIAL_OPTIONS.indexOf(b);
      if (aIndex === bIndex) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    return {
      options,
      hasOther,
      hasCrypto,
    };
  }, [validation.signers, authOptions, mode, isLogin]);

  // Initialize button refs array
  useEffect(() => {
    buttonRefs.current = buttonRefs.current.slice(0, options.length);
  }, [options.length]);

  // Auto-focus first button when sheet opens
  useEffect(() => {
    if (options.length > 0) {
      setHighlightedIndex(0);
      // Small delay to ensure the sheet is fully rendered
      const timer = setTimeout(() => {
        buttonRefs.current[0]?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [options.length]);

  useEffect(() => {
    if (!isLoading) {
      setSelectedAuth(undefined);
    }
  }, [isLoading]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Only handle keyboard events when the sheet is actually open
      if (!isOpen || isLoading) return;

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
            if (option === "password" || option === "sms") {
              onClose(option);
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
    [isOpen, isLoading, options, highlightedIndex, onSubmit, onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleClose = (event?: Event) => {
    if (!isOpen) return; // avoid closing if another drawer is opening
    event?.preventDefault();
    onClose();
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

    if (option === "password" || option === "sms") {
      onClose(option);
    } else {
      setSelectedAuth(option);
      onSubmit(option);
    }
  };

  const { title, icon } = useMemo(() => {
    if (isLogin) {
      return {
        title: "Log In",
        icon: <AchievementPlayerAvatar username={username ?? ""} />,
      };
    }
    if (mode === "crypto") {
      return {
        title: "Choose Wallet",
        icon: <WalletIcon variant="solid" />,
      };
    }
    return {
      title: "Create Controller",
      icon: <PlusIcon variant="line" />,
    };
  }, [isLogin, username, mode]);

  return (
    <Drawer isOpen={isOpen} onClose={handleClose}>
      <DrawerContent title={title} icon={icon}>
        <div className="flex flex-col gap-3">
          {options.map((option, index) => {
            const isPrimary =
              !isLogin && index === 0 && INITIAL_OPTIONS.includes(option);
            const isHighlighted = highlightedIndex === index;
            const isAvailable =
              !EXTERNAL_WALLETS.includes(option as ExternalWalletType) ||
              availableWallets.includes(option as ExternalWalletType);

            return (
              <div
                key={option}
                className={cn(
                  isPrimary && "border-b border-background-125 pb-4",
                )}
              >
                <SignupButton
                  ref={(el) => {
                    buttonRefs.current[index] = el;
                  }}
                  authMethod={option}
                  isPrimary={isPrimary}
                  onClick={(e) => handleSelectedOption(e, option)}
                  onKeyDown={(e) => handleSelectedOption(e, option)}
                  disabled={
                    (isLoading && selectedAuth !== option) || !isAvailable
                  }
                  isLoading={isLoading && selectedAuth === option}
                  data-highlighted={isHighlighted}
                />
              </div>
            );
          })}
          {!isLogin && mode === "initial" && hasOther && (
            <SignupButton
              authMethod="other"
              onClick={() => setMode("expanded")}
            />
          )}
          {!isLogin && mode === "expanded" && hasCrypto && (
            <SignupButton
              authMethod="crypto"
              onClick={() => setMode("crypto")}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
