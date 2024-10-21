import { useMemo } from "react";
import { CurrencyBase, CurrencyQuote, usePriceQuery } from "../api/cartridge";
import { formatBalance } from "../currency";

export function useCountervalue({
  endpoint,
  balance,
  quote,
  base,
}: {
  endpoint: string;
  balance: string;
  quote: CurrencyQuote;
  base: CurrencyBase;
}) {
  const { data, ...rest } = usePriceQuery(
    {
      endpoint,
    },
    {
      quote,
      base,
    },
  );

  const value = useMemo(() => {
    if (!data?.price?.amount || !balance) {
      return 0;
    }

    return BigInt(parseFloat(balance) * parseFloat(data?.price.amount));
  }, [data?.price]);

  const formatted = useMemo(() => formatBalance(BigInt(value)), [value]);

  return { countervalue: { value, formatted }, ...rest };
}
