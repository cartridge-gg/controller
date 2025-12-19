import { useWallets } from "@/hooks/wallets";
import { AUTH_METHODS_LABELS } from "@/utils/connection/constants";
import { allUseSameAuth } from "@/utils/controller";
import { AuthOption } from "@cartridge/controller";
import {
  ArgentIcon,
  Button,
  DiscordIcon,
  GoogleColorIcon,
  IconProps,
  LockIcon,
  MetaMaskIcon,
  PasskeyIcon,
  PhantomIcon,
  RabbyIcon,
  Spinner,
  WalletConnectIcon,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { forwardRef, useMemo } from "react";
import { useUsernameValidation } from "../create/useUsernameValidation";
import { credentialToAuth } from "../types";

interface AuthButtonProps extends React.ComponentProps<typeof Button> {
  waitingForConfirmation: boolean;
  validation: ReturnType<typeof useUsernameValidation>;
  username: string | undefined;
  signupOptions?: AuthOption[];
}

export type LoginAuthConfig = {
  Icon?: React.ComponentType<IconProps>;
  bgColor?: string;
  label: string;
  isExtension?: boolean;
};

const OPTIONS: Partial<Record<string, LoginAuthConfig>> = {
  webauthn: {
    Icon: PasskeyIcon,
    label: AUTH_METHODS_LABELS.webauthn,
  },
  metamask: {
    Icon: MetaMaskIcon,
    bgColor: "bg-wallet-theme-300",
    label: AUTH_METHODS_LABELS.metamask,
    isExtension: true,
  },
  argent: {
    Icon: ArgentIcon,
    bgColor: "bg-wallet-theme-400",
    label: AUTH_METHODS_LABELS.argent,
    isExtension: true,
  },
  rabby: {
    Icon: RabbyIcon,
    bgColor: "bg-wallet-theme-200",
    label: AUTH_METHODS_LABELS.rabby,
    isExtension: true,
  },
  phantom: {
    Icon: PhantomIcon,
    bgColor: "bg-wallet-theme-100",
    label: AUTH_METHODS_LABELS.phantom,
    isExtension: true,
  },
  "phantom-evm": {
    Icon: PhantomIcon,
    bgColor: "bg-wallet-theme-100",
    label: AUTH_METHODS_LABELS["phantom-evm"],
    isExtension: true,
  },
  discord: {
    Icon: DiscordIcon,
    bgColor: "bg-wallet-theme-500",
    label: AUTH_METHODS_LABELS.discord,
  },
  walletconnect: {
    Icon: WalletConnectIcon,
    bgColor: "bg-wallet-theme-600",
    label: AUTH_METHODS_LABELS.walletconnect,
  },
  google: {
    Icon: GoogleColorIcon,
    bgColor: "bg-foreground-100",
    label: AUTH_METHODS_LABELS.google,
  },
  password: {
    Icon: LockIcon,
    bgColor: "bg-background-300",
    label: AUTH_METHODS_LABELS.password,
  },
};

export const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  (
    { waitingForConfirmation, validation, username, signupOptions, ...props },
    ref,
  ) => {
    const { wallets, isExtensionMissing } = useWallets();

    const { isLoading, disabled, ...restProps } = props;

    const option = useMemo(() => {
      // Login flow: use existing signers (only when account exists)
      if (
        validation.exists &&
        validation.signers &&
        validation.signers.length > 0
      ) {
        if (allUseSameAuth(validation.signers)) {
          return OPTIONS[credentialToAuth(validation.signers[0])];
        } else {
          return OPTIONS["webauthn"];
        }
      }

      // Signup flow: if single signer configured
      // Show branded button immediately, even before username is entered
      if (signupOptions && signupOptions.length === 1) {
        return OPTIONS[signupOptions[0]];
      }

      return undefined;
    }, [validation.signers, validation.exists, signupOptions]);

    const extensionsMissingForAllSigners = useMemo(() => {
      if (!option?.isExtension) {
        return false;
      }

      // Login flow: check existing signers
      if (validation.signers && validation.signers.length > 0) {
        return validation.signers.every((signer) => isExtensionMissing(signer));
      }

      // Signup flow: check if single signup option's extension is missing
      if (signupOptions && signupOptions.length === 1) {
        return !wallets.some((wallet) => wallet.type === signupOptions[0]);
      }

      return false;
    }, [
      isExtensionMissing,
      validation.signers,
      option?.isExtension,
      signupOptions,
      wallets,
    ]);

    const icon = useMemo(() => {
      if (isLoading || waitingForConfirmation) {
        return <Spinner size="sm" />;
      }
      const IconComponent = option?.Icon;
      return IconComponent ? <IconComponent size="sm" /> : null;
    }, [isLoading, waitingForConfirmation, option]);

    // Check if login has single signer (or all same auth type)
    const isSingleSignerLogin = useMemo(() => {
      if (!validation.signers || validation.signers.length === 0) {
        return false;
      }
      return (
        validation.signers.length === 1 || allUseSameAuth(validation.signers)
      );
    }, [validation.signers]);

    const text = useMemo(() => {
      if (waitingForConfirmation) {
        return `Waiting for ${option?.label} confirmation`;
      }
      if (isLoading) {
        return null;
      }

      const isLogin = validation.exists || !username;

      // Single signer login: show branded text when existing account found
      if (
        isLogin &&
        validation.exists &&
        isSingleSignerLogin &&
        option?.label
      ) {
        return `log in with ${option.label}`;
      }

      // Single signer signup/initial: show branded text immediately
      if (signupOptions?.length === 1 && option?.label) {
        return isLogin
          ? `log in with ${option.label}`
          : `sign up with ${option.label}`;
      }

      return isLogin ? "log in" : "sign up";
    }, [
      option?.label,
      isLoading,
      waitingForConfirmation,
      validation.exists,
      username,
      signupOptions,
      isSingleSignerLogin,
    ]);

    return (
      <Button
        ref={ref}
        {...restProps}
        className={cn(
          "transition-all duration-300 ease-in-out px-3 py-2.5",
          restProps.className,
          !waitingForConfirmation && ["w-full h-[40px] gap-2", option?.bgColor],
          waitingForConfirmation && [
            "justify-start pointer-events-none rounded-[4px] text-sm normal-case font-normal font-sans border border-background-200 gap-1",
            "bg-background-125",
            "text-foreground-300",
          ],
        )}
        isLoading={false}
        disabled={
          isLoading ||
          disabled ||
          waitingForConfirmation ||
          extensionsMissingForAllSigners
        }
      >
        {icon}
        {text}
      </Button>
    );
  },
);

AuthButton.displayName = "AuthButton";
