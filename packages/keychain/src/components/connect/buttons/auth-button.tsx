import {
  ArgentIcon,
  Button,
  cn,
  DiscordIcon,
  IconProps,
  MetaMaskIcon,
  PhantomIcon,
  RabbyIcon,
  Spinner,
  WalletConnectIcon,
} from "@cartridge/ui-next";
import { useMemo } from "react";
import { useUsernameValidation } from "../create/useUsernameValidation";
import { getControllerSignerProvider } from "../types";

interface AuthButtonProps extends React.ComponentProps<typeof Button> {
  waitingForConfirmation: boolean;
  validation: ReturnType<typeof useUsernameValidation>;
  username: string | undefined;
}

export type LoginAuthConfig = {
  Icon?: React.ComponentType<IconProps>;
  bgColor?: string;
  label: string;
};

export const OPTIONS: Partial<Record<string, LoginAuthConfig>> = {
  webauthn: {
    label: "Passkey",
  },
  metamask: {
    Icon: MetaMaskIcon,
    bgColor: "bg-wallet-theme-300",
    label: "MetaMask",
  },
  argent: {
    Icon: ArgentIcon,
    bgColor: "bg-wallet-theme-400",
    label: "Argent",
  },
  rabby: {
    Icon: RabbyIcon,
    bgColor: "bg-wallet-theme-200",
    label: "Rabby",
  },
  phantom: {
    Icon: PhantomIcon,
    bgColor: "bg-wallet-theme-100",
    label: "Phantom",
  },
  discord: {
    Icon: DiscordIcon,
    bgColor: "bg-wallet-theme-500",
    label: "Discord",
  },
  walletconnect: {
    Icon: WalletConnectIcon,
    bgColor: "bg-wallet-theme-600",
    label: "Wallet Connect",
  },
};

export function AuthButton({
  waitingForConfirmation,
  validation,
  username,
  ...props
}: AuthButtonProps) {
  const { isLoading, disabled, ...restProps } = props;

  const option = useMemo(
    () => OPTIONS[getControllerSignerProvider(validation.signer) ?? ""],
    [validation.signer],
  );

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
    validation.signer,
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
      disabled={isLoading || disabled || waitingForConfirmation}
    >
      {icon}
      {text}
    </Button>
  );
}
