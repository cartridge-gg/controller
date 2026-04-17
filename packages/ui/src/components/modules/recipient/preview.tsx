import {
  ControllerAccountIcon,
  ArgentIcon,
  BraavosIcon,
  OpenZeppelinIcon,
  WalletIcon,
  WalletType,
} from "@/components";
import { formatAddress } from "@/utils";
import { useCallback } from "react";

type PreviewProps = {
  address: string;
  wallet: WalletType;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  name?: string;
};

export const Preview = ({
  address,
  wallet,
  onClick,
  onMouseEnter,
  onMouseLeave,
  name,
}: PreviewProps) => {
  const getIcon = useCallback((wallet: WalletType | null) => {
    switch (wallet) {
      case WalletType.Controller:
        return <ControllerAccountIcon className="h-8 w-8" />;
      case WalletType.ArgentX:
        return <ArgentIcon className="h-8 w-8" />;
      case WalletType.Braavos:
        return <BraavosIcon className="h-8 w-8" />;
      case WalletType.OpenZeppelin:
        return <OpenZeppelinIcon className="h-8 w-8" />;
      default:
        return <WalletIcon variant="solid" className="h-8 w-8" />;
    }
  }, []);

  return (
    <div
      className="bg-spacer h-16 rounded-md flex items-center gap-x-3 px-2.5 py-3 cursor-pointer w-full shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="h-10 w-10 rounded-full overflow-hidden bg-background flex items-center justify-center">
        {getIcon(wallet)}
      </div>
      {name ? (
        <div className="flex flex-col items-start gap-y-0.5">
          <p className="font-medium text-sm">{name}</p>
          <p className="font-normal text-xs text-foreground-400">
            {formatAddress(address, { size: "xs", padding: true })}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-x-2">
          <p className="font-medium text-sm">
            {formatAddress(address, { size: "sm", padding: true })}
          </p>
        </div>
      )}
    </div>
  );
};
