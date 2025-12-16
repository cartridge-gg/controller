import { Call, RpcProvider, shortString, constants } from "starknet";
import { USDC_ADDRESSES } from "@/utils/ekubo";
import {
  USDT_CONTRACT_ADDRESS,
  STRK_CONTRACT_ADDRESS,
  ETH_CONTRACT_ADDRESS,
} from "@cartridge/ui/utils";

export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
}

/**
 * Cached token metadata to avoid RPC calls for common tokens
 */
const CACHED_TOKEN_METADATA: Record<string, TokenMetadata> = {
  // USDC on mainnet
  [USDC_ADDRESSES[constants.StarknetChainId.SN_MAIN].toLowerCase()]: {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
  },
  // USDC on sepolia
  [USDC_ADDRESSES[constants.StarknetChainId.SN_SEPOLIA].toLowerCase()]: {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
  },
  [USDT_CONTRACT_ADDRESS.toLowerCase()]: {
    name: "Tether USD",
    symbol: "USDT",
    decimals: 6,
  },
  [STRK_CONTRACT_ADDRESS.toLowerCase()]: {
    name: "Starknet Token",
    symbol: "STRK",
    decimals: 18,
  },
  [ETH_CONTRACT_ADDRESS.toLowerCase()]: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
};

/**
 * Get cached token metadata without RPC calls, or null if not cached
 */
export function getCachedTokenMetadata(
  tokenAddress: string,
): TokenMetadata | null {
  const normalized = tokenAddress.toLowerCase();
  return CACHED_TOKEN_METADATA[normalized] || null;
}

/**
 * Fetch token metadata via RPC calls
 */
export async function fetchTokenMetadata(
  tokenAddress: string,
  provider: RpcProvider,
): Promise<TokenMetadata> {
  // Check cache first
  const cached = getCachedTokenMetadata(tokenAddress);
  if (cached) {
    return cached;
  }

  const [nameRes, symbolRes, decimalsRes] = await Promise.all([
    provider.callContract({
      contractAddress: tokenAddress,
      entrypoint: "name",
      calldata: [],
    } as Call),
    provider.callContract({
      contractAddress: tokenAddress,
      entrypoint: "symbol",
      calldata: [],
    } as Call),
    provider.callContract({
      contractAddress: tokenAddress,
      entrypoint: "decimals",
      calldata: [],
    } as Call),
  ]);

  // Handle both short string and Cairo byte array responses
  let name = shortString.decodeShortString(nameRes[0]);
  if (nameRes.length > 1) {
    name = shortString.decodeShortString(nameRes[1]);
  }

  let symbol = shortString.decodeShortString(symbolRes[0]);
  if (symbolRes.length > 1) {
    symbol = shortString.decodeShortString(symbolRes[1]);
  }

  return {
    name,
    symbol,
    decimals: Number(decimalsRes[0]),
  };
}

/**
 * Get token metadata, using cache if available or fetching via RPC
 */
export async function getTokenMetadata(
  tokenAddress: string,
  provider: RpcProvider,
): Promise<TokenMetadata> {
  const cached = getCachedTokenMetadata(tokenAddress);
  if (cached) {
    return cached;
  }
  return fetchTokenMetadata(tokenAddress, provider);
}
