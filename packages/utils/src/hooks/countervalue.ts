import { useMemo } from "react";
import {
  PriceByAddressesQuery,
  PricePeriodByAddressesQuery,
  usePriceByAddressesQuery,
  usePricePeriodByAddressesQuery,
} from "../api/cartridge";
import { UseQueryOptions } from "react-query";

function formatValue(balance: string, amount: string, decimals: number) {
  const amountValue = parseFloat(amount) / 10 ** decimals;
  const value = parseFloat(balance) * amountValue;
  // Round and remove insignificant trailing zeros
  const rounded = parseFloat(value.toFixed(2));
  const formatted = value === rounded ? `$${value}` : `~$${rounded}`;
  return {
    value,
    formatted,
  };
}

export function useCountervalue(
  {
    tokens,
  }: {
    tokens: { balance: string; address: string }[];
  },
  options?: UseQueryOptions<
    PriceByAddressesQuery | PricePeriodByAddressesQuery
  >,
) {
  const addresses = useMemo(
    () => tokens.map((token) => token.address),
    [tokens],
  );
  const { data: priceData, ...restPriceData } = usePriceByAddressesQuery(
    {
      addresses: addresses,
    },
    options as UseQueryOptions<PriceByAddressesQuery>,
  );

  const { start, end } = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    const yesterday = now - 24 * 60 * 60;
    return {
      start: yesterday,
      end: yesterday + 3600,
    };
  }, []);

  const { data: pricePeriodData, ...restPricePeriodData } =
    usePricePeriodByAddressesQuery(
      {
        addresses,
        start,
        end,
      },
      options as UseQueryOptions<PricePeriodByAddressesQuery>,
    );

  const countervalues = useMemo(() => {
    return tokens.map(({ balance, address }) => {
      const currentPrice = priceData?.priceByAddresses?.find(
        (price) => BigInt(price.base) === BigInt(address),
      );
      const periodPrice = pricePeriodData?.pricePeriodByAddresses?.find(
        (price) => BigInt(price.base) === BigInt(address),
      );
      if (!currentPrice || !periodPrice) {
        return;
      }
      const { value: currentValue, formatted: currentFormatted } = formatValue(
        balance,
        currentPrice.amount,
        currentPrice.decimals,
      );
      const { value: periodValue, formatted: periodFormatted } = formatValue(
        balance,
        periodPrice.amount,
        periodPrice.decimals,
      );

      return {
        address,
        balance,
        current: {
          value: currentValue,
          formatted: currentFormatted,
        },
        period: {
          value: periodValue,
          formatted: periodFormatted,
        },
      };
    });
  }, [options?.enabled, priceData, pricePeriodData, tokens]);

  return { countervalues, ...restPriceData, ...restPricePeriodData };
}
