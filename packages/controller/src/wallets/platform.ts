import { constants, num } from "starknet";
import type { ExternalPlatform } from "./types";

const PLATFORMS: Record<string, ExternalPlatform> = {
  "0x1": "ethereum", // ethereum mainnet
  "0xaa36a7": "ethereum", // ethereum sepolia
  "0x14a34": "base", // base mainnet
  "0x2105": "base", // base sepolia
  "0x66eee": "arbitrum", // arbitrum mainnet
  "0xa4b1": "arbitrum", // arbitrum sepolia
  "0xa": "optimism", // op mainnet
  "0xaa37dc": "optimism", // op sepolia
  [constants.StarknetChainId.SN_MAIN]: "starknet",
  [constants.StarknetChainId.SN_SEPOLIA]: "starknet",
};

export const chainIdToPlatform = (
  chainId: string,
): ExternalPlatform | undefined => {
  const hex = num.toHex(chainId);
  const platform = PLATFORMS[hex];
  if (!platform) {
    console.warn(`Unknown chain ID: ${hex}`);
  }
  return platform;
};
