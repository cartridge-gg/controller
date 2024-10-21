import { useMemo } from "react";
import { CurrencyBase, CurrencyQuote, usePriceQuery } from "../api/cartridge";

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

  const countervalue = useMemo(() => {
    if (!data?.price?.amount || !balance) {
      return 0;
    }

    return parseFloat(balance) * parseFloat(data?.price.amount);
  }, [data?.price]);

  return { countervalue, ...rest };
}
