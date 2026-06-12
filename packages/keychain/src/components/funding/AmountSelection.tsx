import { useCallback, useEffect, useRef, useState } from "react";
import { Button, DollarIcon, Input, Error } from "@cartridge/controller-ui";
import { cn } from "@cartridge/controller-ui/utils";

export const CREDIT_AMOUNTS = [10, 20, 50];

const DEFAULT_MIN_AMOUNT = 2;
const DEFAULT_MAX_AMOUNT = 1000;

type AmountSelectionProps = {
  creditAmounts?: number[];
  lockSelection?: boolean;
  enableCustom?: boolean;
  minAmount?: number;
  maxAmount?: number;
  onChange: (creditAmount: number) => void;
};

export function AmountSelection({
  creditAmounts = CREDIT_AMOUNTS,
  lockSelection = false,
  enableCustom = true,
  minAmount,
  maxAmount,
  onChange,
}: AmountSelectionProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | undefined>(
    creditAmounts[0],
  );
  const [custom, setCustom] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onChange(selectedAmount && !error ? selectedAmount : 0);
  }, [onChange, selectedAmount, error]);

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
      <div className="grid grid-cols-2 gap-3 text-sm">
        {creditAmounts.map((value) => (
          <Button
            key={value}
            variant="secondary"
            className={cn(
              "font-sans font-medium w-full tracking-normal",
              value === selectedAmount && !custom
                ? "bg-background-300 text-foreground-100 hover:bg-background-400 hover:text-foreground-100 "
                : "bg-background-100 text-foreground-300 hover:bg-background-300 hover:text-foreground-100 ",
            )}
            disabled={lockSelection}
            onClick={() => {
              setCustom(false);
              setSelectedAmount(value);
            }}
          >
            {`$${value}`}
          </Button>
        ))}
        {enableCustom && (
          <Button
            variant="secondary"
            className={cn(
              "font-sans font-medium normal-case w-full tracking-normal",
              custom
                ? "bg-background-300 text-foreground-100 hover:bg-background-400 hover:text-foreground-100 "
                : "bg-background-100 text-foreground-300 hover:bg-background-300 hover:text-foreground-100 ",
            )}
            disabled={lockSelection}
            onClick={() => {
              setCustom(true);
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
            value={selectedAmount ?? ""}
            disabled={lockSelection}
            onChange={(e) => {
              const clean = e.target.value.replace(/^0+/, "");
              const amount = clean ? Number.parseInt(clean, 10) : undefined;
              setSelectedAmount(amount);
              const min = minAmount ?? DEFAULT_MIN_AMOUNT;
              const max = maxAmount ?? DEFAULT_MAX_AMOUNT;
              if (amount && amount < min) {
                setError(`$${min} minimum for purchases`);
              } else if (amount && amount > max) {
                setError(`$${max} maximum for purchases`);
              } else {
                setError(null);
              }
            }}
            onFocus={() => setCustom(true)}
            onClear={() => {
              setSelectedAmount(undefined);
              setError(null);
            }}
          />
          <DollarIcon size="xs" className="absolute top-3 left-3" />
        </div>
      )}
      {error && <Error label={error} />}
    </div>
  );
}
