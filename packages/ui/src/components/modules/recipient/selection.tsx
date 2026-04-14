import {
  ControllerAccountIcon,
  ArgentIcon,
  BraavosIcon,
  OpenZeppelinIcon,
  WalletIcon,
  WalletType,
} from "@/components";
import { cn } from "@/utils";
import { useCallback } from "react";

type SelectionProps = {
  label: string;
  wallet: WalletType;
};

export const Selection = ({ label, wallet }: SelectionProps) => {
  const getIcon = useCallback((wallet: WalletType | null) => {
    switch (wallet) {
      case WalletType.Controller:
        return <ControllerAccountIcon className="h-4 w-4" />;
      case WalletType.ArgentX:
        return <ArgentIcon className="h-4 w-4" />;
      case WalletType.Braavos:
        return <BraavosIcon className="h-4 w-4" />;
      case WalletType.OpenZeppelin:
        return <OpenZeppelinIcon className="h-4 w-4" />;
      default:
        return <WalletIcon variant="solid" className="h-4 w-4" />;
    }
  }, []);

  return (
    <div
      className={cn(
        "flex items-center gap-x-1 select-none",
        !label && "hidden",
      )}
    >
      <div className="w-4 h-4 flex items-center justify-center">
        {getIcon(wallet)}
      </div>
      <p className="text-xs font-medium">{label}</p>
    </div>
  );
};
