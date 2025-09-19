import { AUTH_METHODS_LABELS } from "@/utils/connection/constants";
import {
  ArgentColorIcon,
  Button,
  DiscordColorIcon,
  GoogleColorIcon,
  IconProps,
  LockIcon,
  MetaMaskColorIcon,
  MobileIcon,
  PasskeyIcon,
  PhantomColorIcon,
  RabbyColorIcon,
  Spinner,
  WalletConnectColorIcon,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";

interface SignupButtonProps extends React.ComponentProps<typeof Button> {
  authMethod: string;
}

const OPTIONS: Partial<
  Record<
    string,
    {
      variant: "primary" | "secondary";
      Icon?: React.ComponentType<IconProps>;
      icon?: React.ReactNode;
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
    icon: <MobileIcon size="sm" variant="solid" />,
    label: AUTH_METHODS_LABELS.sms,
  },
};

export function SignupButton({ authMethod, ...props }: SignupButtonProps) {
  const { isLoading, disabled, ...restProps } = props;

  const option = OPTIONS[authMethod];

  if (!option) {
    console.error(`Invalid authMethod provided to SignupButton: ${authMethod}`);
    return null;
  }

  const { Icon, icon, label, ...restOptionProps } = option;

  return (
    <Button
      {...restProps}
      {...restOptionProps}
      className={cn(restProps.className, "w-full h-fit px-3 py-2.5 gap-2")}
      isLoading={false}
      disabled={isLoading || disabled}
    >
      {isLoading ? <Spinner size="sm" /> : Icon ? <Icon size="sm" /> : icon}
      {label}
    </Button>
  );
}
