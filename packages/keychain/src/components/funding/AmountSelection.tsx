import { Button, DollarIcon, Input } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { useCallback, useRef, useState } from "react";

export const USD_AMOUNTS = [10, 25, 50];

type AmountSelectionProps = {
  usdAmounts?: number[];
  lockSelection?: boolean;
  enableCustom?: boolean;
  onChange?: (usdAmount: number) => void;
};

export function AmountSelection({
  usdAmounts = USD_AMOUNTS,
  lockSelection,
  enableCustom,
  onChange,
}: AmountSelectionProps) {
  const [selectedUSD, setSelectedUSD] = useState<number | undefined>(
    usdAmounts[0],
  );
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
          {usdAmounts.map((value) => (
            <Button
              key={value}
              variant="secondary"
              className={cn(
                "w-18 text-sm font-sans font-medium flex-1",
                value === selectedUSD && !custom
                  ? "bg-background-400 text-foreground-100 hover:bg-background-400 hover:text-foreground-100 "
                  : "bg-background-200 text-foreground-300 hover:bg-background-300 hover:text-foreground-200 ",
              )}
              disabled={lockSelection}
              onClick={() => {
                setCustom(false);
                setSelectedUSD(value);
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
                onChange?.(selectedUSD ?? 0);
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
              inputMode="numeric"
              pattern="[0-9]*"
              step="1"
              value={selectedUSD}
              disabled={lockSelection}
              onChange={(e) => {
                const clean = e.target.value.replace(/^0+/, "");
                const amount = Number.parseInt(clean, 10);
                if (!isNaN(amount)) {
                  onChange?.(amount);
                  setSelectedUSD(amount);
                } else {
                  onChange?.(0);
                  setSelectedUSD(undefined);
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
