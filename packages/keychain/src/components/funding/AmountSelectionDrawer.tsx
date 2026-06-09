import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DepositIcon,
  Button,
} from "@cartridge/controller-ui";
import { AmountSelection } from "./AmountSelection";

interface AmountSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  onContinue: (amount: number) => void;
}

export function AmountSelectionDrawer({
  isOpen,
  onClose,
  isLoading,
  onContinue,
}: AmountSelectionDrawerProps) {
  const [amount, setAmount] = useState(0);
  return (
    <Drawer isOpen={isOpen} onClose={onClose} className="gap-4">
      <DrawerContent title="Buy Credits" icon={<DepositIcon variant="solid" />}>
        <AmountSelection
          lockSelection={isLoading}
          enableCustom={true}
          onChange={setAmount}
        />

        <div className="p-3 text-xs border border-background-200 rounded text-foreground-300">
          Credits are an account balance that can be used to pay for games and
          network activity. They are not refundable.
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
