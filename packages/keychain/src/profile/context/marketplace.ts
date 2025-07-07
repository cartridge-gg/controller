import {
  BookModel,
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
  book: BookModel | null;
  orders: {
    [collection: string]: { [token: string]: { [order: string]: OrderModel } };
  };
  addOrder: (order: OrderModel) => void;
  removeOrder: (order: OrderModel) => void;
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
