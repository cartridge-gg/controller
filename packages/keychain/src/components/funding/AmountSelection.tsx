import { Button, DollarIcon, Input, cn } from "@cartridge/ui-next";
import { useCallback, useRef, useState } from "react";
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
  const [selected, setSelected] = useState<number>(amount);
  const [custom, setCustom] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on the input
  const setFocus = useCallback(() => {

    // wait for the input to be rendered
    setTimeout(() => {
      if (inputRef.current) {
        const ref = inputRef.current;
        ref.focus();
      }
    }, 0);
  }, [inputRef]);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-xs font-semibold text-foreground-400 tracking-wide select-none">
        Amount
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          {AMOUNTS.map((value) => (
            <Button
              key={value}
              variant="secondary"
              className={cn(
                "w-18 text-sm font-sans font-medium flex-1",
                value === selected && !custom
                  ? "bg-background-400 text-foreground-100 hover:bg-background-400 hover:text-foreground-100 "
                  : "bg-background-200 text-foreground-300 hover:bg-background-300 hover:text-foreground-200 ",
              )}
              disabled={lockSelection}
              onClick={() => {
                setCustom(false);
                setSelected(value);
                onChange?.(value);
              }}
            >
              {`$${value}`}
            </Button>
          ))}
          {enableCustom && (
            <Button
              variant="secondary"
              className={cn(
                "text-sm font-sans font-medium normal-case flex-1",
                custom
                  ? "bg-background-400 text-foreground-100 hover:bg-background-400 hover:text-foreground-100 "
                  : "bg-background-200 text-foreground-300 hover:bg-background-300 hover:text-foreground-200 ",
              )}
              disabled={lockSelection}
              onClick={() => {
                setCustom(true);
                onChange?.(0);

                if (selected !== amount) {
                  setSelected(amount);
                }

                setFocus();
              }}
            >
              Custom
            </Button>
          )}
        </div>
        {custom && (
          <div className="relative">
            <Input
              ref={inputRef}
              className="pl-8 flex-1"
              type="number"
              inputMode="decimal"
              value={amount || ""}
              disabled={lockSelection}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  onChange?.(0);
                } else {
                  const amount = Number.parseFloat(value);
                  if (!isNaN(amount)) {
                    onChange?.(amount);
                  }
                }
              }}
              onFocus={() => setCustom(true)}
            />
            <DollarIcon size="xs" className="absolute top-3 left-3" />
          </div>
        )}
      </div>
    </div>
  );
}
