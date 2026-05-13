import { Button } from "@cartridge/controller-ui";

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
  purchaseLabel?: string;
  isApplePayAmountTooLow?: boolean;
}

export function QuantityControls({
  quantity,
  isLoading,
  isSendingDeposit,
  globalDisabled,
  bridgeFrom,
  onPurchase,
  onBridge,
  purchaseLabel: customPurchaseLabel,
}: QuantityControlsProps) {
  const purchaseLabel = customPurchaseLabel || `Buy ${quantity}`;

  return (
    <div className="flex flex-row gap-3">
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
