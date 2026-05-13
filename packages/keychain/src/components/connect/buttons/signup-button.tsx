import { AUTH_METHODS_LABELS } from "@/utils/connection/constants";
import {
  ArgentColorIcon,
  Button,
  DiscordColorIcon,
  GoogleColorIcon,
  IconProps,
  MetaMaskColorIcon,
  MobileIcon,
  PasskeyIcon,
  PhantomColorIcon,
  RabbyColorIcon,
  Spinner,
  WalletConnectColorIcon,
  LockIcon,
  KeyIcon,
  WalletIcon,
} from "@cartridge/controller-ui";
import { cn } from "@cartridge/controller-ui/utils";
import { forwardRef } from "react";

interface SignupButtonProps extends React.ComponentProps<typeof Button> {
  authMethod: string;
  isPrimary?: boolean;
}

const OPTIONS: Partial<
  Record<
    string,
    {
      variant: "primary" | "secondary";
      Icon: React.ComponentType<IconProps>;
      label: string;
      className?: string;
    }
  >
> = {
  webauthn: {
    variant: "primary",
    Icon: PasskeyIcon,
    label: AUTH_METHODS_LABELS.webauthn,
    className: "justify-center",
  },
  metamask: {
    variant: "secondary",
    Icon: MetaMaskColorIcon,
    label: AUTH_METHODS_LABELS.metamask,
  },
  argent: {
    variant: "secondary",
    Icon: ArgentColorIcon,
    label: AUTH_METHODS_LABELS.argent,
  },
  rabby: {
    variant: "secondary",
    Icon: RabbyColorIcon,
    label: AUTH_METHODS_LABELS.rabby,
  },
  phantom: {
    variant: "secondary",
    Icon: PhantomColorIcon,
    label: AUTH_METHODS_LABELS.phantom,
  },
  "phantom-evm": {
    variant: "secondary",
    Icon: PhantomColorIcon,
    label: AUTH_METHODS_LABELS["phantom-evm"],
  },
  discord: {
    variant: "secondary",
    Icon: DiscordColorIcon,
    label: AUTH_METHODS_LABELS.discord,
  },
  google: {
    variant: "secondary",
    Icon: GoogleColorIcon,
    label: AUTH_METHODS_LABELS.google,
  },
  walletconnect: {
    variant: "secondary",
    Icon: WalletConnectColorIcon,
    label: AUTH_METHODS_LABELS.walletconnect,
  },
  password: {
    variant: "secondary",
    Icon: LockIcon,
    label: AUTH_METHODS_LABELS.password,
  },
  sms: {
    variant: "secondary",
    Icon: (props: IconProps) => <MobileIcon {...props} variant="solid" />,
    label: AUTH_METHODS_LABELS.sms,
  },
  other: {
    variant: "secondary",
    Icon: (props: IconProps) => <KeyIcon {...props} variant="solid" />,
    label: "Other Options",
  },
  crypto: {
    variant: "secondary",
    Icon: (props: IconProps) => <WalletIcon {...props} variant="solid" />,
    label: "Crypto",
  },
};

export const SignupButton = forwardRef<HTMLButtonElement, SignupButtonProps>(
  ({ authMethod, isPrimary, ...props }, ref) => {
    const { isLoading, disabled, ...restProps } = props;

    const option = OPTIONS[authMethod];

    if (!option) {
      console.error(
        `Invalid authMethod provided to SignupButton: ${authMethod}`,
      );
      return null;
    }

    const { Icon, label, ...restOptionProps } = {
      ...option,
      variant:
        isPrimary === true
          ? "primary"
          : isPrimary === false
            ? "secondary"
            : option.variant,
    };

    return (
      <Button
        ref={ref}
        {...restProps}
        {...restOptionProps}
        className={cn(
          "w-full h-fit px-3 py-2.5 gap-2 justify-start",
          "ring-0 focus-visible:ring-0 ring-offset-0 focus-visible:ring-offset-0 outline-none",
          isPrimary && "justify-center data-[highlighted=true]:opacity-80",
          restProps.className,
        )}
        isLoading={false}
        disabled={isLoading || disabled}
      >
        {isLoading ? <Spinner size="sm" /> : <Icon size="sm" />}
        {label}
      </Button>
    );
  },
);

SignupButton.displayName = "SignupButton";
