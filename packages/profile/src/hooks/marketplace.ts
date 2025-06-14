import { useContext } from "react";
import { MarketplaceContext } from "#context/marketplace";

/**
 * Custom hook to access the Marketplace context and account information.
 * Must be used within a MarketplaceProvider component.
 *
 * @returns An object containing:
 * - chainId: The chain id
 * - provider: The Marketplace provider instance
 * - orders: All the existing orders
 * @throws {Error} If used outside of a MarketplaceProvider context
 */
export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);

  if (!context) {
    throw new Error(
      "The `useMarketplace` hook must be used within a `MarketplaceProvider`",
    );
  }

  const { chainId, provider, orders } = context;

  return {
    chainId,
    provider,
    orders,
  };
};
