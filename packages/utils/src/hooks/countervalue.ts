import { useMemo } from "react";
import { PriceQuery, TokenPair, usePriceQuery } from "../api/cartridge";
import { UseQueryOptions } from "react-query";

export function useCountervalue(
  {
    balance,
    pair,
  }: {
    balance: string;
    pair: TokenPair;
  },
  options?: UseQueryOptions<PriceQuery>,
) {
  const { data, ...rest } = usePriceQuery(
    {
      pairs: [pair],
    },
    options,
  );

  const countervalue = useMemo(() => {
    const price = data?.price?.[0];
    if (options?.enabled === false || !price) {
      return;
    }

    const amount = parseFloat(data?.price?.[0]?.amount) / 10 ** price.decimals;
    const value = parseFloat(balance) * amount;
    // Round and remove insignificant trailing zeros
    const rounded = parseFloat(value.toFixed(2));
    const formatted = value === rounded ? `$${value}` : `~$${rounded}`;

    return {
      value,
      formatted,
    };
  }, [options?.enabled, data?.price, balance]);

  return { countervalue, ...rest };
}
