import { ListIcon } from "@cartridge/ui";

interface WalletSelectorProps {
  walletName: string;
  walletIcon: React.ReactNode;
  bridgeFrom: string | null;
  onClick: () => void;
}

export function WalletSelector({
  walletName,
  walletIcon,
  bridgeFrom,
  onClick,
}: WalletSelectorProps) {
  return (
    <div
      className="flex h-[40px] justify-between border border-background-200 bg-[#181C19] rounded-[4px] text-xs text-foreground-300 p-2 transition-colors cursor-pointer hover:bg-background-200"
      onClick={onClick}
    >
      <div className="flex gap-2">
        <span className="m-auto">{walletIcon}</span>
        <span className="m-auto text-sm">Purchase with {walletName}</span>
        {bridgeFrom ? `(${bridgeFrom})` : ""}
      </div>
      <ListIcon size="xs" variant="solid" />
    </div>
  );
}
