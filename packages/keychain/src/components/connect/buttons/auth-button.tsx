import { useWallets } from "@/hooks/wallets";
import { AUTH_METHODS_LABELS } from "@/utils/connection/constants";
import { allUseSameAuth } from "@/utils/controller";
import {
  ArgentIcon,
  Button,
  DiscordIcon,
  IconProps,
  MetaMaskIcon,
  PhantomIcon,
  RabbyIcon,
  Spinner,
  WalletConnectIcon,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { useMemo } from "react";
import { useUsernameValidation } from "../create/useUsernameValidation";
import { credentialToAuth } from "../types";

interface AuthButtonProps extends React.ComponentProps<typeof Button> {
  waitingForConfirmation: boolean;
  validation: ReturnType<typeof useUsernameValidation>;
  username: string | undefined;
}

export type LoginAuthConfig = {
  Icon?: React.ComponentType<IconProps>;
  bgColor?: string;
  label: string;
  isExtension?: boolean;
};

const OPTIONS: Partial<Record<string, LoginAuthConfig>> = {
  webauthn: {
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
};

export function AuthButton({
  waitingForConfirmation,
  validation,
  username,
  ...props
}: AuthButtonProps) {
  const { isExtensionMissing } = useWallets();

  const { isLoading, disabled, ...restProps } = props;

  const option = useMemo(() => {
    if (!validation.signers || validation.signers.length === 0) {
      return;
    }

    if (allUseSameAuth(validation.signers)) {
      return OPTIONS[credentialToAuth(validation.signers[0])];
    } else {
      return OPTIONS["webauthn"];
    }
  }, [validation.signers]);

  const extensionsMissingForAllSigners = useMemo(() => {
    if (!option?.isExtension) {
      return false;
    }
    if (!validation.signers) {
      return false;
    }
    return validation.signers.every((signer) => isExtensionMissing(signer));
  }, [isExtensionMissing, validation.signers]);

  const icon = useMemo(() => {
    if (isLoading || waitingForConfirmation) {
      return <Spinner size="sm" />;
    }
    const IconComponent = option?.Icon;
    return IconComponent ? <IconComponent size="sm" /> : null;
  }, [isLoading, waitingForConfirmation, option]);

  const text = useMemo(() => {
    if (waitingForConfirmation) {
      return `Waiting for ${option?.label} confirmation`;
    }
    if (isLoading) {
      return null;
    }
    return validation.exists || !username ? "log in" : "sign up";
  }, [
    option?.label,
    isLoading,
    waitingForConfirmation,
    validation.signers,
    validation.exists,
    username,
  ]);

  return (
    <Button
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
}
