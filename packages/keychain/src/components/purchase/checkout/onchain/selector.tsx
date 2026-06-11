import React from "react";
import { cn, ListIcon } from "@cartridge/controller-ui";
import { getPaymentMethodDisplay, type PaymentMethod } from "./wallet-drawer";

interface WalletSelectorProps {
  method: PaymentMethod | null;
  bridgeFrom?: string | null;
  onClick: () => void;
  disabled?: boolean;
}

export function WalletSelector({
  method,
  bridgeFrom,
  onClick,
  disabled,
}: WalletSelectorProps) {
  const { name, icon } = getPaymentMethodDisplay(method);
  return (
    <div
      className={cn(
        "flex h-[40px] justify-between border border-background-200 bg-[#181C19] rounded-[4px] text-xs text-foreground-300 p-2 transition-colors cursor-pointer hover:bg-background-200",
        disabled && "pointer-events-none",
      )}
      onClick={onClick}
    >
      <div className="flex gap-2">
        <span className="m-auto">
          {React.cloneElement(icon as React.ReactElement, { size: "sm" })}
        </span>
        <span className="m-auto text-sm">Purchase with {name}</span>
        {bridgeFrom ? `(${bridgeFrom})` : ""}
      </div>
      <ListIcon size="xs" variant="solid" />
    </div>
  );
}
