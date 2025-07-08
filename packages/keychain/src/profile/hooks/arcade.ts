import { useContext, useMemo } from "react";
import { ArcadeContext } from "#profile/context/arcade";
import { useAccount } from "./account";
import { getChecksumAddress } from "starknet";
import { ArcadeProvider, EditionModel, GameModel } from "@cartridge/arcade";

type UseArcadeResponse = {
  chainId: string;
  provider: ArcadeProvider | null;
  pins: Record<string, string[]>;
  followers: Record<string, string[]>;
  followeds: Record<string, string[]>;
  games: Record<string, GameModel>;
  editions: Record<string, EditionModel>;
  followersCount: number;
  followedsCount: number;
  error?: string;
};

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
export const useArcade = (): UseArcadeResponse => {
  const { address, error } = useAccount();
  const context = useContext(ArcadeContext);

  if (!context) {
    throw new Error(
      "The `useArcade` hook must be used within a `ArcadeProvider`",
    );
  }

  if (error) {
    return {
      chainId: "",
      provider: null,
      pins: {},
      followers: {},
      followeds: {},
      games: {},
      editions: {},
      followersCount: 0,
      followedsCount: 0,
      error,
    };
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
