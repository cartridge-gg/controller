import { creditsToUSD, usdToCredits } from "@/hooks/tokens";
import { Button, DollarIcon, Input, cn } from "@cartridge/ui-next";
import { useCallback, useRef, useState } from "react";

export const USD_AMOUNTS = [1, 5, 10];

type AmountSelectionProps = {
  wholeCredits: number;
  lockSelection?: boolean;
  enableCustom?: boolean;
  onChange?: (amount: number) => void;
};

export function AmountSelection({
  wholeCredits,
  lockSelection,
  enableCustom,
  onChange,
}: AmountSelectionProps) {
  const [selectedUSD, setSelectedUSD] = useState<number>(
    creditsToUSD(wholeCredits),
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
          {USD_AMOUNTS.map((value) => (
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
                onChange?.(usdToCredits(value));
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
                const usd = creditsToUSD(wholeCredits);
                if (selectedUSD !== usd) {
                  setSelectedUSD(usd);
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
              inputMode="numeric"
              pattern="[0-9]*"
              step="1"
              value={creditsToUSD(wholeCredits) || ""}
              disabled={lockSelection}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  onChange?.(0);
                } else {
                  const amount = Number.parseInt(value, 10);
                  if (!isNaN(amount) && amount >= 0) {
                    onChange?.(usdToCredits(amount));
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
