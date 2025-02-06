import { Error } from "./error";
import { Max } from "./max";
import { Conversion } from "./conversion";
import { Field } from "./field";
import { Header } from "./header";
import { Balance } from "./balance";
import { useCallback, useMemo, useState } from "react";

export type AmountProps = {
  amount: number | undefined;
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
  const [value, setValue] = useState<number | undefined>(amount);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) onChange(e);
      const value = e.target.value;
      setValue(value === "" ? undefined : Number(value));
    },
    [setValue],
  );

  const handleMax = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement> | React.MouseEvent<HTMLButtonElement>,
    ) => {
      if (onMax) onMax(e);
      e.preventDefault();
      setValue(balance);
    },
    [balance, setValue],
  );

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
          <Header label="Balance:" />
          <Balance value={balance} symbol={symbol} onClick={handleMax} />
        </div>
      </div>

      <div className="flex flex-col gap-y-3">
        <div className="relative">
          <Field value={value} onChange={handleChange} />
          <Conversion value={conversion} />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Max onClick={handleMax} />
          </div>
        </div>
        <Error label={error} />
      </div>
    </div>
  );
}
