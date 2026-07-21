import React from "react";
import { ListIcon } from "@cartridge/controller-ui";
import { cn } from "@cartridge/controller-ui/utils";
import type { CoinflowDestination } from "@/hooks/payments/coinflow-withdraw";
import { getDestinationDisplay } from "./constants";

interface SelectedWithdrawMethodProps {
  destination: CoinflowDestination;
  /** Re-opens the transfer-method drawer to change the selection. */
  onClick: () => void;
  disabled?: boolean;
}

/**
 * Slim summary of the confirmed transfer method, shown on the overview
 * drawer's amount step — mirror of the checkout WalletSelector; clicking it
 * re-opens the WithdrawMethodDrawer.
 */
export function SelectedWithdrawMethod({
  destination,
  onClick,
  disabled,
}: SelectedWithdrawMethodProps) {
  const { icon, title } = getDestinationDisplay(destination);

  return (
    <div
      className={cn(
        "flex h-[40px] items-center justify-between border border-background-200 bg-[#181C19] rounded-[4px] text-xs text-foreground-300 p-2 transition-colors cursor-pointer hover:bg-background-200",
        disabled && "pointer-events-none",
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        {React.cloneElement(icon, { size: "sm" })}
        <span className="text-sm">Transfer to {title}</span>
      </div>
      <ListIcon size="xs" variant="solid" />
    </div>
  );
}
