import { useMemo } from "react";
import { CurrencyBase, CurrencyQuote, usePriceQuery } from "../api/cartridge";
import { formatBalance } from "../currency";

export function useCountervalue({
  balance,
  quote,
  base,
}: {
  balance: string;
  quote: CurrencyQuote;
  base: CurrencyBase;
}) {
  const { data, ...rest } = usePriceQuery({
    quote,
    base,
  });

  const value = useMemo(() => {
    if (!data?.price?.amount || !balance) {
      return 0;
    }

    return parseFloat(balance) * parseFloat(data?.price.amount);
  }, [data?.price]);

  const formatted = useMemo(() => formatBalance(value.toString(), 2), [value]);

  return { countervalue: { value, formatted }, ...rest };
}
