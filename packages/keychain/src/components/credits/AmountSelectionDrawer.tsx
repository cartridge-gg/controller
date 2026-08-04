import { useState } from "react";
import { Drawer, DrawerContent, Button } from "@cartridge/controller-ui";
import { CREDITS_DESCRIPTION } from "@/components/inventory/token";
import { AmountSelection } from "@/components/funding/AmountSelection";
import { ErrorCard } from "@/components/purchase/checkout/onchain/error";

interface AmountSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  minAmount?: number;
  maxAmount?: number;
  isLoading?: boolean;
  error?: string;
  onContinue: (amount: number) => void;
}

export function AmountSelectionDrawer({
  isOpen,
  onClose,
  minAmount,
  maxAmount,
  isLoading,
  error,
  onContinue,
}: AmountSelectionDrawerProps) {
  const [amount, setAmount] = useState(0);
  return (
    <Drawer isOpen={isOpen} onClose={onClose} className="gap-4">
      <DrawerContent title="Deposit USD">
        <AmountSelection
          lockSelection={isLoading}
          enableCustom={true}
          minAmount={minAmount}
          maxAmount={maxAmount}
          onChange={setAmount}
        />

        <div className="p-3 text-xs border border-background-200 rounded text-foreground-300">
          {CREDITS_DESCRIPTION}
        </div>

        {error && (
          <ErrorCard variant="error" title="Age Restricted" message={error} />
        )}

        <Button
          disabled={!amount || !!error}
          isLoading={isLoading}
          onClick={() => {
            onContinue(amount);
          }}
        >
          Continue
        </Button>
      </DrawerContent>
    </Drawer>
  );
}
