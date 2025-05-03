import {
  Header,
  Error,
  Input,
  Button,
  PlusIcon,
  MinusIcon,
} from "@/components";
import { Max } from "./max";
import { Conversion } from "./conversion";
import { Balance } from "./balance";
import { useEffect, useMemo } from "react";

type AmountProps = {
  amount: number | undefined;
  conversion: string | undefined;
  balance: number;
  symbol: string;
  decimals: number;
  submitted: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMax: (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => void;
  setError: (error: Error | undefined) => void;
  title?: string;
  label?: string;
  min?: number;
  max?: number;
  onPlus?: (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => void;
  onMinus?: (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => void;
};

export function Amount({
  amount,
  conversion,
  balance,
  symbol,
  decimals,
  submitted,
  onChange,
  onMax,
  setError,
  title = "Amount",
  label = "Balance",
  min,
  max,
  onPlus,
  onMinus,
}: AmountProps) {
  const error = useMemo(() => {
    if (amount && amount > balance) return "Insufficient balance";
    const minAmountStr = decimals > 1 ? `0.${"0".repeat(decimals - 1)}1` : "0";
    if (amount && amount < parseFloat(minAmountStr))
      return `Min value is ${minAmountStr}`;
    if (submitted && !amount) return "Invalid amount";
    return "";
  }, [amount, balance, decimals, submitted]);

  useEffect(() => {
    setError(error ? { name: "Error", message: error } : undefined);
  }, [error, setError]);

  return (
    <div className="flex flex-col gap-y-px">
      <div className="flex items-center justify-between">
        <Header label={title} />
        <div className="flex items-center gap-2">
          <Header label={`${label}:`} />
          <Balance value={balance} symbol={symbol} onClick={onMax} />
        </div>
      </div>

      <div className="flex flex-col gap-y-3">
        <div className="flex items-center gap-3">
          <div className="relative grow">
            <Input
              size="lg"
              type="number"
              className="h-10 pr-28"
              placeholder={(0).toLocaleString()}
              value={amount ?? ""}
              error={error ? { name: "Error", message: "" } : undefined}
              onChange={onChange}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-x-3 justify-end">
              <Conversion value={amount && !error ? conversion : undefined} />
              <Max onClick={onMax} />
            </div>
          </div>
          {!!onMinus && min !== undefined && (
            <Button
              variant="secondary"
              className="h-10 w-10 p-2.5"
              onClick={onMinus}
              disabled={(amount || 0) <= min}
            >
              <MinusIcon size="xs" />
            </Button>
          )}
          {!!onPlus && max !== undefined && (
            <Button
              variant="secondary"
              className="h-10 w-10 p-2.5"
              onClick={onPlus}
              disabled={(amount || 0) >= max}
            >
              <PlusIcon variant="solid" size="xs" />
            </Button>
          )}
        </div>
        <Error label={error} />
      </div>
    </div>
  );
}
