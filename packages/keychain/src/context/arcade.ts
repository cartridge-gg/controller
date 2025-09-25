import { ArcadeProvider, BookModel, EditionModel, GameModel, ListingEvent, OrderModel, SaleEvent } from "@cartridge/arcade";
import { createContext } from "react";

/**
 * Interface defining the shape of the Arcade context.
 */
interface ArcadeContextType {
  /** The Arcade client instance */
  chainId: string;
  provider: ArcadeProvider;
  pins: { [playerId: string]: string[] };
  followers: { [playerId: string]: string[] };
  followeds: { [playerId: string]: string[] };
  games: { [gameId: string]: GameModel };
  editions: { [editionId: string]: EditionModel };
  book: BookModel | null;
  orders: {
    [collection: string]: { [token: string]: { [order: string]: OrderModel } };
  };
  listings: {
    [collection: string]: { [token: string]: { [listing: string]: ListingEvent } };
  };
  sales: {
    [collection: string]: { [token: string]: { [sale: string]: SaleEvent } };
  };
  addOrder: (order: OrderModel) => void;
  removeOrder: (order: OrderModel) => void;
}

/**
 * React context for sharing Arcade-related data throughout the application.
 */
export const ArcadeContext = createContext<ArcadeContextType | null>(null);
