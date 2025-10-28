import { useCallback, useEffect, useState } from "react";
import { useController } from "./controller";
import {
  CairoByteArray,
  Call,
  constants,
  RpcProvider,
  shortString,
  uint256,
} from "starknet";
import type { OnchainQuote } from "@/context";
import {
  fetchSwapQuote,
  USDC_ADDRESSES,
  type EkuboNetwork,
} from "@/utils/ekubo";
import {
  USDT_CONTRACT_ADDRESS,
  STRK_CONTRACT_ADDRESS,
  ETH_CONTRACT_ADDRESS,
} from "@cartridge/ui/utils";

interface TokenMetadata {
  symbol: string;
  decimals: number;
}

interface ItemOnchain {
  name: string;
  description: string;
  imageUri: string;
}

interface StarterPackMetadataOnchain {
  name: string;
  description: string;
  imageUri: string;
  items: ItemOnchain[];
}

/**
 * Cached token metadata to avoid RPC calls for common tokens
 */
const CACHED_TOKEN_METADATA: Record<string, TokenMetadata> = {
  // USDC on mainnet
  [USDC_ADDRESSES.mainnet.toLowerCase()]: {
    symbol: "USDC",
    decimals: 6,
  },
  // USDC on sepolia
  [USDC_ADDRESSES.sepolia.toLowerCase()]: {
    symbol: "USDC",
    decimals: 6,
  },
  [USDT_CONTRACT_ADDRESS.toLowerCase()]: {
    symbol: "USDT",
    decimals: 6,
  },
  [STRK_CONTRACT_ADDRESS.toLowerCase()]: {
    symbol: "STRK",
    decimals: 18,
  },
  [ETH_CONTRACT_ADDRESS.toLowerCase()]: {
    symbol: "ETH",
    decimals: 18,
  },
};

/**
 * Get cached token metadata without RPC calls, or null if not cached
 */
function getCachedTokenMetadata(tokenAddress: string): TokenMetadata | null {
  const normalized = tokenAddress.toLowerCase();
  return CACHED_TOKEN_METADATA[normalized] || null;
}

/**
 * Fetch token metadata via RPC calls
 */
async function fetchTokenMetadata(
  tokenAddress: string,
  provider: RpcProvider,
): Promise<TokenMetadata> {
  const [symbolRes, decimalsRes] = await Promise.all([
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

  return {
    symbol: shortString.decodeShortString(symbolRes[0]),
    decimals: Number(decimalsRes[0]),
  };
}

/**
 * Convert chainId to Ekubo network type
 */
function chainIdToEkuboNetwork(chainId: string): EkuboNetwork {
  switch (chainId) {
    case constants.StarknetChainId.SN_MAIN:
      return "mainnet";
    case constants.StarknetChainId.SN_SEPOLIA:
      return "sepolia";
    default:
      console.warn(`Unknown chainId ${chainId}, defaulting to mainnet`);
      return "mainnet";
  }
}

export const useStarterPackOnchain = (
  starterpackId?: number,
  amount?: number,
  hasReferral?: boolean,
  targetToken?: string, // Token to convert prices to (defaults to USDC)
) => {
  const { controller } = useController();

  const [isLoading, setIsLoading] = useState(true);
  const [isQuoteLoading, setIsQuoteLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [metadata, setMetadata] = useState<StarterPackMetadataOnchain | null>(
    null,
  );
  const [quote, setQuote] = useState<OnchainQuote | null>(null);
  const [supply, setSupply] = useState<number | undefined>(undefined);

  // Fetch metadata first (fast)
  useEffect(() => {
    if (!controller || starterpackId === undefined) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const fetchMetadata = async () => {
      setError(null);

      try {
        const metadataRes = await controller.provider.callContract({
          contractAddress: import.meta.env.VITE_STARTERPACK_REGISTRY_CONTRACT,
          entrypoint: "metadata",
          calldata: [starterpackId],
        } as Call);

        // Parse metadata ByteArray
        const metadataByteArray = CairoByteArray.factoryFromApiResponse(
          metadataRes[Symbol.iterator](),
        );
        const metadataString = metadataByteArray.decodeUtf8();
        const metadata = JSON.parse(
          metadataString,
        ) as StarterPackMetadataOnchain;

        setMetadata(metadata);
      } catch (error) {
        console.error(error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [controller, starterpackId]);

  // Fetch quote separately (can be slower due to Ekubo conversion)
  useEffect(() => {
    if (!controller || starterpackId === undefined) {
      setIsQuoteLoading(false);
      return;
    }

    setIsQuoteLoading(true);
    const fetchQuote = async () => {
      try {
        const quoteRes = await controller.provider.callContract({
          contractAddress: import.meta.env.VITE_STARTERPACK_REGISTRY_CONTRACT,
          entrypoint: "quote",
          calldata: [starterpackId, amount ? amount : 1, hasReferral ? 1 : 0],
        } as Call);

        // Parse quote with u256 values (2 felts each) + paymentToken (1 felt)
        const paymentToken = quoteRes[8];

        // Fetch payment token metadata via RPC
        const paymentTokenMetadata = await fetchTokenMetadata(
          paymentToken,
          controller.provider,
        );

        const totalCost = uint256.uint256ToBN({
          low: quoteRes[6],
          high: quoteRes[7],
        });

        const quote: OnchainQuote = {
          basePrice: uint256.uint256ToBN({
            low: quoteRes[0],
            high: quoteRes[1],
          }),
          referralFee: uint256.uint256ToBN({
            low: quoteRes[2],
            high: quoteRes[3],
          }),
          protocolFee: uint256.uint256ToBN({
            low: quoteRes[4],
            high: quoteRes[5],
          }),
          totalCost,
          paymentToken,
          paymentTokenMetadata,
        };

        // Convert price to target token if specified and different from payment token
        const network = chainIdToEkuboNetwork(controller.chainId());
        const targetTokenAddress = targetToken || USDC_ADDRESSES[network];
        if (paymentToken.toLowerCase() !== targetTokenAddress.toLowerCase()) {
          try {
            const swapQuote = await fetchSwapQuote(
              totalCost,
              paymentToken,
              targetTokenAddress,
              network,
            );

            // Get target token metadata (use cache or fetch via RPC)
            const targetTokenMetadata =
              getCachedTokenMetadata(targetTokenAddress) ||
              (await fetchTokenMetadata(
                targetTokenAddress,
                controller.provider,
              ));

            quote.convertedPrice = {
              amount: swapQuote.total,
              token: targetTokenAddress,
              tokenMetadata: targetTokenMetadata,
              priceImpact: swapQuote.impact,
            };
          } catch (error) {
            console.error("Failed to fetch converted price:", error);
            // Don't fail the entire quote if conversion fails
          }
        }

        setQuote(quote);
      } catch (error) {
        console.error("Failed to fetch quote:", error);
        // Don't set error state for quote failures to allow metadata to still be shown
      } finally {
        setIsQuoteLoading(false);
      }
    };

    fetchQuote();
  }, [controller, starterpackId, amount, hasReferral, targetToken]);

  // Refetch supply function (can be called manually)
  const refetchSupply = useCallback(async () => {
    if (!controller || starterpackId === undefined) {
      return;
    }

    try {
      const supplyRes = await controller.provider.callContract({
        contractAddress: import.meta.env.VITE_STARTERPACK_REGISTRY_CONTRACT,
        entrypoint: "supply",
        calldata: [starterpackId],
      } as Call);

      // Supply is Option<u32>
      // If first element is 0x0 (None), supply is undefined
      // If first element is 0x1 (Some), second element contains the value
      const supply = supplyRes[0] === "0x0" ? undefined : Number(supplyRes[1]);

      setSupply(supply);
    } catch (error) {
      console.error("Failed to fetch supply:", error);
      // Don't set error state for supply failures, just log it
    }
  }, [controller, starterpackId]);

  // Fetch supply separately (reactive/dynamic data)
  useEffect(() => {
    refetchSupply();
  }, [refetchSupply]);

  return {
    isLoading,
    isQuoteLoading,
    error,
    metadata,
    quote,
    supply,
    refetchSupply,
  };
};
