import { Error } from "./error";
import { Max } from "./max";
import { Conversion } from "./conversion";
import { Field } from "./field";
import { Header } from "./header";
import { Balance } from "./balance";
import { useMemo } from "react";

export type AmountProps = {
  amount: number;
  balance: number;
  symbol: string;
  decimals: number;
  conversion: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMax: (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => void;
};

export function Amount({
  amount,
  balance,
  symbol,
  decimals,
  conversion,
  onChange,
  onMax,
}: AmountProps) {
  const error = useMemo(() => {
    if (amount && amount > balance) return "Insufficient balance";
    const minAmountStr = `0.${"0".repeat(decimals - 1)}1`;
    if (amount && amount < parseFloat(minAmountStr))
      return `Amount must be at least ${minAmountStr} ${symbol}`;
    return "";
  }, [amount, balance, symbol, decimals]);

  return (
    <div className="flex flex-col gap-y-px">
      <div className="flex items-center justify-between">
        <Header />
        <div className="flex items-center gap-2">
          <p className="text-[11px]/3 uppercase font-bold text-muted-foreground">
            Balance:
          </p>
          <Balance value={balance} symbol={symbol} onClick={onMax} />
        </div>
      </div>

      <div className="flex flex-col gap-y-3">
        <div className="relative">
          <Field value={amount} onChange={onChange} />
          <Conversion value={conversion} />
          <Max onClick={onMax} />
        </div>
        <Error label={error} />
      </div>
    </div>
  );
}
