import { useEffect, useState } from "react";
import { useController } from "./controller";
import { CairoByteArray, Call, uint256 } from "starknet";

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

interface QuoteOnchain {
  basePrice: bigint;
  referralFee: bigint;
  protocolFee: bigint;
  totalCost: bigint;
  paymentToken: string;
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
  const [quote, setQuote] = useState<QuoteOnchain | null>(null);
  const [supply, setSupply] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!controller || starterpackId === undefined) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log("fetching starterpack onchain");
    const fetch = async () => {
      setError(null);

      try {
        const [metadataRes, quoteRes, supplyRes] = await Promise.all([
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
          controller.provider.callContract({
            contractAddress: import.meta.env.VITE_STARTERPACK_REGISTRY_CONTRACT,
            entrypoint: "supply",
            calldata: [starterpackId ],
          } as Call),
        ]);

        // Supply is Option<u32>
        const supply = supplyRes[0] === "0x1" ? undefined : Number(supplyRes[1]);

        // Parse metadata ByteArray
        const metadataByteArray = CairoByteArray.factoryFromApiResponse(
          metadataRes[Symbol.iterator](),
        );
        const metadataString = metadataByteArray.decodeUtf8();
        const metadata = JSON.parse(
          metadataString,
        ) as StarterPackMetadataOnchain;

        // Parse quote with u256 values (2 felts each) + paymentToken (1 felt)
        const quote: QuoteOnchain = {
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
          paymentToken: quoteRes[8],
        };

        setMetadata(metadata);
        setQuote(quote);
        setSupply(supply);
      } catch (error) {
        console.error(error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetch();
  }, [controller, starterpackId, amount, hasReferral]);

  return {
    isLoading,
    error,
    metadata,
    quote,
    supply,
  };
};
