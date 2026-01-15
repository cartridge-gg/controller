import { Button, MinusIcon, PlusIcon } from "@cartridge/ui";
import { ReactNode } from "react";

interface QuantityControlsProps {
  quantity: number;
  isSendingDeposit: boolean;
  globalDisabled: boolean;
  hasSufficientBalance: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  children: ReactNode;
}

export function QuantityControls({
  quantity,
  isSendingDeposit,
  globalDisabled,
  hasSufficientBalance,
  onIncrement,
  onDecrement,
  children,
}: QuantityControlsProps) {
  const isQuantityDisabled =
    (globalDisabled && hasSufficientBalance) || isSendingDeposit;

  return (
    <div className="flex flex-row gap-3">
      <Button
        variant="secondary"
        onClick={onDecrement}
        disabled={isQuantityDisabled || quantity <= 1}
      >
        <MinusIcon size="xs" />
      </Button>
      <Button
        variant="secondary"
        onClick={onIncrement}
        disabled={isQuantityDisabled}
      >
        <PlusIcon size="xs" variant="solid" />
      </Button>
      {children}
    </div>
  );
}
