import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DepositIcon,
  Button,
} from "@cartridge/controller-ui";
import { CREDITS_DESCRIPTION } from "@/components/inventory/token";
import { AmountSelection } from "@/components/funding/AmountSelection";

interface AmountSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  minAmount?: number;
  maxAmount?: number;
  isLoading?: boolean;
  onContinue: (amount: number) => void;
  initialAmount?: number;
}

export function AmountSelectionDrawer({
  isOpen,
  onClose,
  minAmount,
  maxAmount,
  isLoading,
  onContinue,
  initialAmount,
}: AmountSelectionDrawerProps) {
  const [amount, setAmount] = useState(initialAmount ?? 0);
  return (
    <Drawer isOpen={isOpen} onClose={onClose} className="gap-4">
      <DrawerContent title="Deposit USD" icon={<DepositIcon variant="solid" />}>
        <AmountSelection
          lockSelection={isLoading}
          enableCustom={true}
          minAmount={minAmount}
          maxAmount={maxAmount}
          initialAmount={initialAmount}
          onChange={setAmount}
        />

        <div className="p-3 text-xs border border-background-200 rounded text-foreground-300">
          {CREDITS_DESCRIPTION}
        </div>

        <Button
          disabled={!amount}
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
