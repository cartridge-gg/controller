import {
  ListingEvent,
  MarketplaceProvider,
  OrderModel,
  SaleEvent,
} from "@cartridge/marketplace";
import { createContext } from "react";

/**
 * Interface defining the shape of the Marketplace context.
 */
interface MarketplaceContextType {
  /** The Marketplace client instance */
  chainId: string;
  provider: MarketplaceProvider;
  orders: {
    [collection: string]: { [token: string]: { [order: string]: OrderModel } };
  };
  sales: {
    [collection: string]: { [token: string]: { [sale: string]: SaleEvent } };
  };
  listings: {
    [collection: string]: {
      [token: string]: { [listing: string]: ListingEvent };
    };
  };
}

/**
 * React context for sharing Marketplace-related data throughout the application.
 */
export const MarketplaceContext = createContext<MarketplaceContextType | null>(
  null,
);
