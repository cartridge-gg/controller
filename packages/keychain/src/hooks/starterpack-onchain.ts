import { useCallback, useEffect, useState } from "react";
import { useController } from "./controller";
import { CairoByteArray, Call, shortString, uint256 } from "starknet";
import type { OnchainQuote } from "@/context";

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

export const useStarterPackOnchain = (
  starterpackId?: number,
  amount?: number,
  hasReferral?: boolean,
) => {
  const { controller } = useController();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [metadata, setMetadata] = useState<StarterPackMetadataOnchain | null>(
    null,
  );
  const [quote, setQuote] = useState<OnchainQuote | null>(null);
  const [supply, setSupply] = useState<number | undefined>(undefined);

  // Fetch metadata and quote (static data)
  useEffect(() => {
    if (!controller || starterpackId === undefined) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const fetch = async () => {
      setError(null);

      try {
        const [metadataRes, quoteRes] = await Promise.all([
          controller.provider.callContract({
            contractAddress: import.meta.env.VITE_STARTERPACK_REGISTRY_CONTRACT,
            entrypoint: "metadata",
            calldata: [starterpackId],
          } as Call),
          controller.provider.callContract({
            contractAddress: import.meta.env.VITE_STARTERPACK_REGISTRY_CONTRACT,
            entrypoint: "quote",
            calldata: [starterpackId, amount ? amount : 1, hasReferral ? 1 : 0],
          } as Call),
        ]);

        // Parse metadata ByteArray
        const metadataByteArray = CairoByteArray.factoryFromApiResponse(
          metadataRes[Symbol.iterator](),
        );
        const metadataString = metadataByteArray.decodeUtf8();
        const metadata = JSON.parse(
          metadataString,
        ) as StarterPackMetadataOnchain;

        // Parse quote with u256 values (2 felts each) + paymentToken (1 felt)
        const paymentToken = quoteRes[8];

        // Fetch token metadata (symbol and decimals)
        const [symbolRes, decimalsRes] = await Promise.all([
          controller.provider.callContract({
            contractAddress: paymentToken,
            entrypoint: "symbol",
            calldata: [],
          } as Call),
          controller.provider.callContract({
            contractAddress: paymentToken,
            entrypoint: "decimals",
            calldata: [],
          } as Call),
        ]);

        const symbol = shortString.decodeShortString(symbolRes[0]);
        const decimals = Number(decimalsRes[0]);

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
          totalCost: uint256.uint256ToBN({
            low: quoteRes[6],
            high: quoteRes[7],
          }),
          paymentToken,
          paymentTokenMetadata: {
            symbol,
            decimals,
          },
        };

        setMetadata(metadata);
        setQuote(quote);
      } catch (error) {
        console.error(error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetch();
  }, [controller, starterpackId, amount, hasReferral]);

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
    error,
    metadata,
    quote,
    supply,
    refetchSupply,
  };
};
