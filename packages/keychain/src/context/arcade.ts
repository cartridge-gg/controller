import {
  ArcadeProvider,
  BookModel,
  ListingEvent,
  OrderModel,
  SaleEvent,
} from "@cartridge/arcade";
import { createContext } from "react";

/**
 * Interface defining the shape of the Arcade context.
 */
interface ArcadeContextType {
  /** The Arcade client instance */
  chainId: string;
  provider: ArcadeProvider;
  book: BookModel | null;
  orders: {
    [collection: string]: { [token: string]: { [order: string]: OrderModel } };
  };
  listings: {
    [collection: string]: {
      [token: string]: { [listing: string]: ListingEvent };
    };
  };
  sales: {
    [collection: string]: { [token: string]: { [sale: string]: SaleEvent } };
  };
  addOrder: (order: OrderModel) => void;
  removeOrder: (order: OrderModel) => void;
  initializable: boolean;
  setInitializable: (initializable: boolean) => void;
}

/**
 * React context for sharing Arcade-related data throughout the application.
 */
export const ArcadeContext = createContext<ArcadeContextType | null>(null);
