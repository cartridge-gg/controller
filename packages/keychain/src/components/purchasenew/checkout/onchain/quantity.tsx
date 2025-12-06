import { Button, MinusIcon, PlusIcon } from "@cartridge/ui";

interface QuantityControlsProps {
  quantity: number;
  isLoading: boolean;
  isSendingDeposit: boolean;
  globalDisabled: boolean;
  hasSufficientBalance: boolean;
  bridgeFrom: string | null;
  onIncrement: () => void;
  onDecrement: () => void;
  onPurchase: () => void;
  onBridge: () => void;
}

export function QuantityControls({
  quantity,
  isLoading,
  isSendingDeposit,
  globalDisabled,
  hasSufficientBalance,
  bridgeFrom,
  onIncrement,
  onDecrement,
  onPurchase,
  onBridge,
}: QuantityControlsProps) {
  const purchaseLabel = bridgeFrom ? "Bridge" : `Buy ${quantity}`;
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
      <Button
        className="w-full"
        isLoading={isLoading || isSendingDeposit}
        disabled={globalDisabled}
        onClick={bridgeFrom !== null ? onBridge : onPurchase}
      >
        {purchaseLabel}
      </Button>
    </div>
  );
}
