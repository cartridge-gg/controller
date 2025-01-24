import {
  DollarIcon,
  Button,
  cn,
  useDisclosure,
  Input,
} from "@cartridge/ui-next";
import { useState } from "react";
import { AMOUNTS } from "./constants";

type AmountSelectionProps = {
  amount: number;
  lockSelection?: boolean;
  enableCustom?: boolean;
  onChange?: (amount: number) => void;
};

export function AmountSelection({
  amount,
  lockSelection,
  enableCustom,
  onChange,
}: AmountSelectionProps) {
  const { onOpen, onClose, isOpen } = useDisclosure();

  const [selected, setSelected] = useState<number>(amount);
  const [custom, setCustom] = useState<boolean>(false);

  return (
    <div className="flex items-center justify-between">
      <div className="text-xs font-semibold uppercase text-muted-foreground">
        Amount
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {AMOUNTS.map((value) => (
            <Button
              key={value}
              variant="secondary"
              className={cn(
                "w-18",
                value === selected && !custom
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
              disabled={lockSelection}
              onClick={() => {
                setCustom(false);
                setSelected(value);
                onChange?.(value);
                onClose();
              }}
            >
              {`$${value}`}
            </Button>
          ))}
          {enableCustom && (
            <Button
              variant="secondary"
              className={custom ? "text-foreground" : "text-muted-foreground"}
              disabled={lockSelection}
              onClick={() => {
                setCustom(true);
                onOpen();
              }}
            >
              Custom
            </Button>
          )}
        </div>
        {isOpen && (
          <div className="flex items-center w-full relative">
            <Input
              className="pl-8"
              type="number"
              step={0.01}
              min={0.01}
              value={amount}
              disabled={lockSelection}
              onChange={(e) => {
                const amount = parseInt(e.target.value);
                onChange?.(amount);
              }}
            />
            <DollarIcon size="xs" className="absolute top-3 left-3" />
          </div>
        )}
      </div>
    </div>
  );
}
