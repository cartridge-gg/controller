import { useMemo } from "react";
import {
  CurrencyBase,
  CurrencyQuote,
  PriceQuery,
  usePriceQuery,
} from "../api/cartridge";
import { formatBalance } from "../currency";
import { UseQueryOptions } from "react-query";

export function useCountervalue(
  {
    balance,
    quote,
    base,
  }: {
    balance: string;
    quote: CurrencyQuote;
    base: CurrencyBase;
  },
  options?: UseQueryOptions<PriceQuery>,
) {
  const { data, ...rest } = usePriceQuery(
    {
      quote,
      base,
    },
    options,
  );

  const countervalue = useMemo(() => {
    if (options?.enabled === false || !data?.price?.amount) {
      return;
    }

    const value = parseFloat(balance) * parseFloat(data?.price.amount);
    const formatted = formatBalance(value.toString(), 2);

    return {
      value,
      formatted,
    };
  }, [options?.enabled, data?.price, balance]);

  return { countervalue, ...rest };
}
