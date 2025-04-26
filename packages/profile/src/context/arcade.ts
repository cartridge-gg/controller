import { ArcadeProvider, EditionModel, GameModel } from "@bal7hazar/arcade-sdk";
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
}

/**
 * React context for sharing Arcade-related data throughout the application.
 */
export const ArcadeContext = createContext<ArcadeContextType | null>(null);
