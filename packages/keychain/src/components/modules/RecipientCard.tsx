import { useUsername } from "@/hooks/account";
import { useWallet } from "@/hooks/wallet";
import { formatAddress } from "@cartridge/ui/utils";
import {
  UserIcon,
  WalletType,
  ArgentIcon,
  BraavosIcon,
  CartridgeIcon,
} from "@cartridge/ui";

interface RecipientCardProps {
  address: string;
  name?: string;
  walletType?: WalletType;
}

export function RecipientCard({
  address,
  name: providedName,
  walletType: providedWalletType,
}: RecipientCardProps) {
  // Only fetch if not provided
  const { username } = useUsername({
    address: providedName ? "" : address,
  });
  const { wallet } = useWallet({
    address: providedWalletType ? "" : address,
  });

  const name = providedName || username;
  const walletType = providedWalletType || wallet;

  // Get appropriate wallet icon based on wallet type
  const getWalletIcon = () => {
    const iconProps = { className: "w-full h-full" };

    switch (walletType) {
      case WalletType.ArgentX:
        return <ArgentIcon {...iconProps} />;
      case WalletType.Braavos:
        return <BraavosIcon {...iconProps} />;
      case WalletType.Controller:
        return <CartridgeIcon {...iconProps} />;
      case WalletType.OpenZeppelin:
        return (
          <UserIcon
            variant="solid"
            {...iconProps}
            className="w-full h-full text-foreground-300"
          />
        );
      default:
        return (
          <UserIcon
            variant="solid"
            {...iconProps}
            className="w-full h-full text-foreground-300"
          />
        );
    }
  };

  return (
    <div className="flex flex-col gap-px rounded-[4px] overflow-hidden">
      <div className="bg-background-200 box-border flex gap-1 items-center justify-start p-3">
        <p className="text-foreground-400 text-xs font-semibold tracking-[0.24px]">
          Recipient
        </p>
      </div>
      <div className="bg-background-200 box-border flex gap-3 items-center justify-start overflow-hidden px-3 py-3">
        <div className="bg-background-300 box-border flex gap-2.5 items-center justify-center overflow-hidden p-[5px] rounded-[20px] shrink-0">
          <div className="overflow-hidden relative shrink-0 w-[30px] h-[30px]">
            {getWalletIcon()}
          </div>
        </div>
        <div className="flex flex-col gap-0.5 items-start justify-center leading-[0] relative shrink-0">
          <div className="flex flex-col justify-center relative shrink-0 text-sm text-white font-medium">
            <p className="leading-[20px] text-nowrap whitespace-pre">
              {name || "Unknown"}
            </p>
          </div>
          <div className="flex flex-col justify-center relative shrink-0 text-xs text-foreground-300 font-normal">
            <p className="leading-[16px] text-nowrap whitespace-pre">
              {formatAddress(address)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
