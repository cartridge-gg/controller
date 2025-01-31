import { useContext, useEffect } from "react";
import { TokenPair } from "@cartridge/utils/api/cartridge";
import { PriceContext } from "@/components/provider/price";

export function usePrice(pair: TokenPair) {
  const context = useContext(PriceContext);
  if (!context) {
    throw new Error("usePrice must be used within a PriceProvider");
  }

  useEffect(() => {
    context.registerPair(pair);
  }, [context, pair]);

  return {
    price: context.prices[pair],
    isLoading: context.isLoading,
    error: context.error,
  };
}
