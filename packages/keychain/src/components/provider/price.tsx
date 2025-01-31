import {
  PropsWithChildren,
  createContext,
  useMemo,
  useState,
  useCallback,
} from "react";
import {
  Price,
  TokenPair,
  usePriceQuery,
} from "@cartridge/utils/api/cartridge";
import { UseQueryOptions } from "react-query";
import { PriceQuery } from "@cartridge/utils/api/cartridge";

interface PriceContextValue {
  prices: Record<string, Price>;
  isLoading: boolean;
  error?: Error;
  registerPair: (pair: TokenPair) => void;
}

export const PriceContext = createContext<PriceContextValue>({
  prices: {},
  isLoading: false,
  registerPair: () => {},
});

export function PriceProvider({
  children,
  initialPairs = [],
  options,
}: PropsWithChildren<{
  initialPairs?: TokenPair[];
  options?: UseQueryOptions<PriceQuery>;
}>) {
  const [pairs, setPairs] = useState<TokenPair[]>(initialPairs);

  const { data, isLoading, error } = usePriceQuery(
    {
      pairs,
    },
    {
      ...options,
      refetchInterval: 30 * 1000,
    },
  );

  const prices = useMemo(() => {
    const prices: Record<string, Price> = {};
    data?.price?.forEach((price) => {
      if (!price) return;
      const key = `${price.base}_${price.quote}`;
      prices[key] = price;
    });
    return prices;
  }, [data?.price]);

  const registerPair = useCallback(
    (pair: TokenPair) => {
      setPairs((prev) => {
        if (prices[pair]) return prev;
        return [...prev, pair];
      });
    },
    [prices],
  );

  const value = useMemo(
    () => ({
      prices,
      isLoading,
      error: error as Error | undefined,
      registerPair,
    }),
    [prices, isLoading, error, registerPair],
  );

  return (
    <PriceContext.Provider value={value}>{children}</PriceContext.Provider>
  );
}
