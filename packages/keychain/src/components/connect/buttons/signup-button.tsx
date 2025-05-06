import { AUTH_METHODS_LABELS } from "@/utils/connection/constants";
import {
  ArgentColorIcon,
  Button,
  cn,
  DiscordColorIcon,
  IconProps,
  MetaMaskColorIcon,
  PasskeyIcon,
  PhantomColorIcon,
  RabbyColorIcon,
  Spinner,
  WalletConnectColorIcon,
} from "@cartridge/ui-next";

interface SignupButtonProps extends React.ComponentProps<typeof Button> {
  authMethod: string;
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
  discord: {
    variant: "secondary",
    Icon: DiscordColorIcon,
    label: AUTH_METHODS_LABELS.discord,
  },
  walletconnect: {
    variant: "secondary",
    Icon: WalletConnectColorIcon,
    label: AUTH_METHODS_LABELS.walletconnect,
  },
};

export function SignupButton({ authMethod, ...props }: SignupButtonProps) {
  const { isLoading, disabled, ...restProps } = props;

  const option = OPTIONS[authMethod];

  if (!option) {
    console.error(`Invalid authMethod provided to SignupButton: ${authMethod}`);
    return null;
  }

  const { Icon, label, ...restOptionProps } = option;

  return (
    <Button
      {...restProps}
      {...restOptionProps}
      className={cn(restProps.className, "w-full h-fit px-3 py-2.5 gap-2")}
      isLoading={false}
      disabled={isLoading || disabled}
    >
      {isLoading ? <Spinner size="sm" /> : <Icon size="sm" />}
      {label}
    </Button>
  );
}
