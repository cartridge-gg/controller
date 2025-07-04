import { useContext, useMemo } from "react";
import { ArcadeContext } from "../profile-context/arcade";
import { useAccount } from "./account";
import { getChecksumAddress } from "starknet";

/**
 * Custom hook to access the Arcade context and account information.
 * Must be used within a ArcadeProvider component.
 *
 * @returns An object containing:
 * - chainId: The chain id
 * - provider: The Arcade provider instance
 * - pins: All the existing pins
 * - games: The registered games
 * @throws {Error} If used outside of a ArcadeProvider context
 */
export const useArcade = () => {
  const { address } = useAccount();
  const context = useContext(ArcadeContext);

  if (!context) {
    throw new Error(
      "The `useArcade` hook must be used within a `ArcadeProvider`",
    );
  }

  const { chainId, provider, pins, followers, followeds, games, editions } =
    context;

  const { followersCount, followedsCount } = useMemo(() => {
    if (!address) {
      return {
        followersCount: 0,
        followedsCount: 0,
      };
    }
    return {
      followersCount: followers[getChecksumAddress(address)]?.length || 0,
      followedsCount: followeds[getChecksumAddress(address)]?.length || 0,
    };
  }, [followers, followeds, address]);

  return {
    chainId,
    provider,
    pins,
    followers,
    followeds,
    games,
    editions,
    followersCount,
    followedsCount,
  };
};
