import { useCallback, useEffect, useState, useMemo } from "react";
import { useController } from "@/hooks/controller";
import { useConnection } from "@/hooks/connection";
import { CairoByteArray, Call, getChecksumAddress, uint256 } from "starknet";
import { fetchSwapQuote, USDC_ADDRESSES } from "@/utils/ekubo";
import { getCurrentReferral } from "@/utils/referral";
import { Quote } from "@/context";
import {
  fetchTokenMetadata,
  getCachedTokenMetadata,
} from "@/utils/token-metadata";

// Raw JSON from contract (snake_case)
interface ItemOnchainRaw {
  name: string;
  description: string;
  image_uri: string;
}

interface StarterPackMetadataOnchainRaw {
  name: string;
  description: string;
  image_uri: string;
  items: ItemOnchainRaw[];
  additional_payment_tokens?: string[];
  conditions?: string[];
}

// TypeScript interface (camelCase)
interface ItemOnchain {
  name: string;
  description: string;
  imageUri: string;
}

export interface StarterPackMetadataOnchain {
  name: string;
  description: string;
  imageUri: string;
  items: ItemOnchain[];
  additionalPaymentTokens?: string[];
  conditions?: string[];
}

// Convert snake_case JSON from contract to camelCase TypeScript
function convertMetadata(
  raw: StarterPackMetadataOnchainRaw,
): StarterPackMetadataOnchain {
  return {
    name: raw.name,
    description: raw.description,
    imageUri: raw.image_uri,
    items: raw.items.map((item) => ({
      name: item.name,
      description: item.description,
      imageUri: item.image_uri,
    })),
    additionalPaymentTokens: raw.additional_payment_tokens?.map((token) =>
      getChecksumAddress(`0x${BigInt(token).toString(16)}`),
    ),
    conditions: raw.conditions,
  };
}

export const useOnchainStarterpack = ({
  onchainId,
  amount,
  targetToken,
  registryAddress = import.meta.env.VITE_STARTERPACK_REGISTRY_CONTRACT,
  isBundle,
}: {
  onchainId?: number;
  amount?: number;
  targetToken?: string; // Token to convert prices to (defaults to USDC)
  registryAddress?: string;
  isBundle?: boolean;
}) => {
  const { controller } = useController();
  const { origin } = useConnection();

  const [isLoading, setIsLoading] = useState(true);
  const [isQuoteLoading, setIsQuoteLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [metadata, setMetadata] = useState<StarterPackMetadataOnchain | null>(
    null,
  );
  const [quote, setQuote] = useState<Quote | null>(null);
  const [supply, setSupply] = useState<number | undefined>(undefined);

  // Auto-detect if there's a valid referral for the current game
  const hasReferral = useMemo(
    () => getCurrentReferral(origin) !== null,
    [origin],
  );

  // Fetch metadata first (fast)
  useEffect(() => {
    if (!controller || onchainId === undefined) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const fetchMetadata = async () => {
      setError(null);

      try {
        const metadataRes = await controller.provider.callContract({
          contractAddress: registryAddress,
          entrypoint: isBundle ? "get_metadata" : "metadata",
          calldata: [onchainId],
        } as Call);

        // Parse metadata ByteArray
        const metadataByteArray = CairoByteArray.factoryFromApiResponse(
          metadataRes[Symbol.iterator](),
        );
        const metadataString = metadataByteArray.decodeUtf8();

        let rawMetadata: StarterPackMetadataOnchainRaw;
        try {
          rawMetadata = JSON.parse(
            metadataString,
          ) as StarterPackMetadataOnchainRaw;
        } catch (parseError) {
          console.error(
            "Failed to parse starterpack metadata JSON:",
            parseError,
          );
          console.error("Metadata string:", metadataString);
          throw new Error(
            "Invalid starterpack metadata. Please contact the starterpack creator.",
          );
        }

        // Convert snake_case to camelCase
        const metadata = convertMetadata(rawMetadata);

        setMetadata(metadata);
      } catch (error) {
        console.error("Failed to fetch starterpack metadata:", error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [controller, onchainId, registryAddress, isBundle]);

  // Fetch quote separately (can be slower due to Ekubo conversion)
  useEffect(() => {
    if (!controller || onchainId === undefined) {
      setIsQuoteLoading(false);
      return;
    }

    setIsQuoteLoading(true);
    const fetchQuote = async () => {
      try {
        const parseStarterpackQuote = (quote: string[]) => {
          // pub struct StarterpackQuote {
          //     pub base_price: u256, // 0,1
          //     pub referral_fee: u256, // 2,3
          //     pub protocol_fee: u256, // 4,5
          //     pub total_cost: u256, // 6,7
          //     pub payment_token: ContractAddress, // 8
          // }
          return {
            basePrice: uint256.uint256ToBN({ low: quote[0], high: quote[1] }),
            referralFee: uint256.uint256ToBN({ low: quote[2], high: quote[3] }),
            protocolFee: uint256.uint256ToBN({ low: quote[4], high: quote[5] }),
            totalCost: uint256.uint256ToBN({ low: quote[6], high: quote[7] }),
            paymentToken: quote[8],
          };
        };

        const parseBundleQuote = (quote: string[]) => {
          // pub struct BundleQuote {
          //     pub base_price: u256, // 0,1
          //     pub referral_fee: u256, // 2,3
          //     pub client_fee: u256, // 4,5
          //     pub protocol_fee: u256, // 6,7
          //     pub total_cost: u256, // 8,9
          //     pub payment_token: ContractAddress, // 10
          //     pub contract: ContractAddress, // 11
          // }
          return {
            basePrice: uint256.uint256ToBN({ low: quote[0], high: quote[1] }),
            referralFee: uint256.uint256ToBN({ low: quote[2], high: quote[3] }),
            // clientFee: uint256.uint256ToBN({ low: quote[4], high: quote[5] }),
            protocolFee: uint256.uint256ToBN({ low: quote[6], high: quote[7] }),
            totalCost: uint256.uint256ToBN({ low: quote[8], high: quote[9] }),
            paymentToken: quote[10],
            // contract: quote[11],
          };
        };

        const quoteRes = await controller.provider.callContract({
          contractAddress: registryAddress,
          entrypoint: "quote",
          calldata: [
            onchainId,
            amount ? amount : 1,
            hasReferral ? 1 : 0,
            ...(isBundle ? [0] : []), // client_percentage
          ],
        } as Call);

        const { basePrice, referralFee, protocolFee, totalCost, paymentToken } =
          isBundle
            ? parseBundleQuote(quoteRes)
            : parseStarterpackQuote(quoteRes);

        // Fetch payment token metadata via RPC
        const paymentTokenMetadata = await fetchTokenMetadata(
          paymentToken,
          controller.provider,
        );

        const quote: Quote = {
          basePrice,
          referralFee,
          protocolFee,
          totalCost,
          paymentToken,
          paymentTokenMetadata,
        };

        // Convert price to target token if specified and different from payment token
        const chainId = controller.chainId();
        const targetTokenAddress = targetToken || USDC_ADDRESSES[chainId];
        if (
          targetTokenAddress &&
          paymentToken.toLowerCase() !== targetTokenAddress.toLowerCase() &&
          totalCost > 0n
        ) {
          try {
            const swapQuote = await fetchSwapQuote(
              totalCost,
              paymentToken,
              targetTokenAddress,
              chainId,
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
        setError(new Error("Failed to fetch quote"));
      } finally {
        setIsQuoteLoading(false);
      }
    };

    fetchQuote();
  }, [
    controller,
    onchainId,
    registryAddress,
    isBundle,
    amount,
    hasReferral,
    targetToken,
  ]);

  // Refetch supply function (can be called manually)
  const refetchSupply = useCallback(async () => {
    if (!controller || onchainId === undefined || isBundle) {
      return;
    }

    try {
      const supplyRes = await controller.provider.callContract({
        contractAddress: registryAddress,
        entrypoint: "supply",
        calldata: [onchainId],
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
  }, [controller, onchainId, registryAddress, isBundle]);

  // Fetch supply separately (reactive/dynamic data)
  useEffect(() => {
    refetchSupply();
  }, [refetchSupply]);

  return {
    isLoading,
    isQuoteLoading,
    error,
    metadata,
    quote: isQuoteLoading ? null : quote,
    supply,
    refetchSupply,
  };
};
