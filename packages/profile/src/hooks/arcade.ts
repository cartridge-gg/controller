import { useContext } from "react";
import { ArcadeContext } from "../components/context/arcade";

/**
 * Custom hook to access the Arcade context and account information.
 * Must be used within a ArcadeProvider component.
 *
 * @returns An object containing:
 * - chainId: The chain id
 * - provider: The Arcade provider instance
 * - pins: The pins for the current player
 * - games: The games for the current player
 * @throws {Error} If used outside of a ArcadeProvider context
 */
export const useArcade = () => {
  const context = useContext(ArcadeContext);

  if (!context) {
    throw new Error(
      "The `useArcade` hook must be used within a `ArcadeProvider`",
    );
  }

  const { chainId, provider, pins, games } = context;

  return { chainId, provider, pins, games };
};
