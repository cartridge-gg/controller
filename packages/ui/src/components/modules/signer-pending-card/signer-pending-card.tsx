import { MobileIcon, WalletIcon } from "@/components/icons";
import {
  ArgentColorIcon,
  DiscordColorIcon,
  GoogleColorIcon,
  MetaMaskColorIcon,
  PhantomColorIcon,
  RabbyColorIcon,
  WalletConnectColorIcon,
} from "@/components/icons/brand-color";
import { FingerprintIcon } from "@/components/icons/brand/fingerprint";
import { cn, formatAddress } from "@/utils";

export type SignerPendingCardKind =
  | "google"
  | "sms"
  | "passkey"
  | "discord"
  | "metamask"
  | "argent"
  | "rabby"
  | "phantom"
  | "phantom-evm"
  | "walletconnect"
  | "wallet";

interface SignerPendingCardProps {
  className?: string;
  kind: SignerPendingCardKind;
  inProgress: boolean;
  error?: string;
  authedAddress?: string;
}

const variants: Record<
  SignerPendingCardKind,
  {
    icon: React.ReactNode;
    primaryText: string;
    secondaryText: string;
    label?: string;
  }
> = {
  google: {
    icon: <GoogleColorIcon size="xl" />,
    primaryText: "Connecting to Google",
    secondaryText: "Continue in the other window",
  },
  discord: {
    icon: <DiscordColorIcon size="xl" />,
    primaryText: "Connecting to Discord",
    secondaryText: "Continue in the other window",
  },
  sms: {
    icon: <MobileIcon variant="solid" size="xl" />,
    primaryText: "",
    secondaryText: "",
    label: "SMS",
  },
  passkey: {
    icon: <FingerprintIcon size="xl" variant="line" />,
    primaryText: "Waiting for Confirmation",
    secondaryText: "Continue in browser",
  },
  metamask: {
    icon: <MetaMaskColorIcon size="xl" />,
    primaryText: "Waiting for Signature",
    secondaryText: "Don't see your wallet? Check your other browser windows",
  },
  argent: {
    icon: <ArgentColorIcon size="xl" />,
    primaryText: "Waiting for Signature",
    secondaryText: "Don't see your wallet? Check your other browser windows",
  },
  rabby: {
    icon: <RabbyColorIcon size="xl" />,
    primaryText: "Waiting for Signature",
    secondaryText: "Don't see your wallet? Check your other browser windows",
  },
  phantom: {
    icon: <PhantomColorIcon size="xl" />,
    primaryText: "Waiting for Signature",
    secondaryText: "Don't see your wallet? Check your other browser windows",
  },
  "phantom-evm": {
    icon: <PhantomColorIcon size="xl" />,
    primaryText: "Waiting for Signature",
    secondaryText: "Don't see your wallet? Check your other browser windows",
    label: "Phantom",
  },
  walletconnect: {
    icon: <WalletConnectColorIcon size="xl" />,
    primaryText: "Waiting for Signature",
    secondaryText: "Continue on your mobile device",
    label: "WalletConnect",
  },
  wallet: {
    icon: <WalletIcon variant="solid" size="xl" />,
    primaryText: "",
    secondaryText: "",
    label: "Wallet",
  },
} as const;

export function SignerPendingCard({
  className,
  kind,
  inProgress,
  error,
  authedAddress,
}: SignerPendingCardProps) {
  const { icon, primaryText, secondaryText, label } = variants[kind];

  if (kind === "sms" && (inProgress || error)) {
    return <></>;
  }
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        "w-full h-fit p-10 gap-4",
        "rounded",
        "border border-background-200",
        "bg-background-100",
        className,
      )}
    >
      {icon && (
        <div
          className={cn(
            "w-fit h-fit p-2",
            "rounded-[32px]",
            "border border-background-200",
            error && "border-destructive-100",
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-2 justify-center items-center">
        <span
          className={cn(
            "text-foreground-300 text-sm font-medium text-center",
            error && "text-destructive-100",
            authedAddress && "text-constructive-100",
          )}
        >
          {error
            ? error
            : inProgress
              ? primaryText
              : authedAddress
                ? "This wallet is already authenticated"
                : "Success!"}
        </span>
        <span
          className={cn("text-foreground-400 text-sm font-medium text-center")}
        >
          {error
            ? "Please try connecting again"
            : inProgress
              ? secondaryText
              : authedAddress
                ? formatAddress(authedAddress, { size: "xs" })
                : (label || kind.charAt(0).toUpperCase() + kind.slice(1)) +
                  " connected"}
        </span>
      </div>
    </div>
  );
}
