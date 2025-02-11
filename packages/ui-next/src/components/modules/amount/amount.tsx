import { Header, Error } from "@/components";
import { Max } from "./max";
import { Conversion } from "./conversion";
import { Field } from "./field";
import { Balance } from "./balance";
import { useMemo } from "react";

type AmountProps = {
  amount: number | undefined;
  conversion: string | undefined;
  balance: number;
  symbol: string;
  decimals: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMax: (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => void;
};

export function Amount({
  amount,
  conversion,
  balance,
  symbol,
  decimals,
  onChange,
  onMax,
}: AmountProps) {
  const error = useMemo(() => {
    if (amount && amount > balance) return "Insufficient balance";
    const minAmountStr = decimals > 1 ? `0.${"0".repeat(decimals - 1)}1` : "0";
    if (amount && amount < parseFloat(minAmountStr))
      return `Min value is ${minAmountStr}`;
    return "";
  }, [amount, balance, decimals]);

  return (
    <div className="flex flex-col gap-y-px">
      <div className="flex items-center justify-between">
        <Header />
        <div className="flex items-center gap-2">
          <Header label="Balance:" />
          <Balance value={balance} symbol={symbol} onClick={onMax} />
        </div>
      </div>

      <div className="flex flex-col gap-y-3">
        <div className="relative">
          <Field value={amount} isError={!!error} onChange={onChange} />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-x-3 justify-end">
            <Conversion value={amount && !error ? conversion : undefined} />
            <Max onClick={onMax} />
          </div>
        </div>
        <Error label={error} />
      </div>
    </div>
  );
}
