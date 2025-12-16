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
}

// TypeScript interface (camelCase)
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
  additionalPaymentTokens?: string[];
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
  };
}

export const useOnchainStarterpack = (
  starterpackId?: number,
  amount?: number,
  targetToken?: string, // Token to convert prices to (defaults to USDC)
) => {
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

        const quote: Quote = {
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
        const chainId = controller.chainId();
        const targetTokenAddress = targetToken || USDC_ADDRESSES[chainId];
        if (
          targetTokenAddress &&
          paymentToken.toLowerCase() !== targetTokenAddress.toLowerCase()
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
