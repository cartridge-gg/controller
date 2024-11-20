import { useMemo } from "react";
import { PriceQuery, TokenPair, usePriceQuery } from "../api/cartridge";
import { formatBalance } from "../currency";
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
    if (options?.enabled === false || !data?.price?.[0]?.amount) {
      return;
    }

    const value = parseFloat(balance) * parseFloat(data?.price?.[0]?.amount);
    const formatted = formatBalance(value.toString(), 2);

    return {
      value,
      formatted,
    };
  }, [options?.enabled, data?.price, balance]);

  return { countervalue, ...rest };
}
