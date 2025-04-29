import { useCallback, useEffect, useState } from "react";
import {
  StarterPackDocument,
  StarterPackQuery,
} from "@cartridge/utils/api/cartridge";
import { client } from "@/utils/graphql";
import { creditsToUSD } from "./tokens";
import { useController } from "./controller";
import { RpcProvider, uint256 } from "starknet";

export const enum StarterItemType {
  NFT = "NFT",
  CREDIT = "CREDIT",
}

export interface StarterItemData {
  title: string;
  collectionName?: string;
  description: string;
  price: number;
  image?: string;
  type: StarterItemType;
  value?: number;
}

export interface StarterPackDetails {
  id: string;
  price: number;
  supply: bigint | null;
  starterPackItems: StarterItemData[];
}

export function useStarterPack(starterpackId: string) {
  const { controller } = useController();
  const [isLoading, setIsLoading] = useState(true);
  const [supply, setSupply] = useState<bigint | null>(null);
  const [items, setItems] = useState<StarterItemData[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [price, setPrice] = useState<number>(0);

  const checkSupply = useCallback(
    async (contractAddress: string, entrypoint: string, calldata: string[]) => {
      if (!controller) {
        throw new Error("Controller not found");
      }

      const result = await controller.provider.callContract({
        contractAddress: contractAddress,
        entrypoint: entrypoint,
        calldata: calldata,
      });

      const supply = uint256.uint256ToBN({
        low: result[0],
        high: result[1],
      });

      return supply;
    },
    [controller],
  );

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    client
      .request<StarterPackQuery>(StarterPackDocument, { id: starterpackId })
      .then(async (result) => {
        const items: StarterItemData[] = [];
        if (result.starterpack) {
          let minSupply = null;
          if (result.starterpack.starterpackContract?.edges) {
            for (const edge of result.starterpack.starterpackContract.edges) {
              items.push({
                title: edge?.node?.name ?? "",
                description: edge?.node?.description ?? "",
                price: creditsToUSD(result.starterpack.price),
                image: edge?.node?.iconURL ?? "",
                type: StarterItemType.NFT,
              });

              if (edge?.node?.supplyEntryPoint) {
                const newSupply = await checkSupply(
                  edge?.node?.contractAddress,
                  edge?.node?.supplyEntryPoint,
                  edge?.node?.supplyCalldata,
                );
                if (!minSupply || newSupply < minSupply) {
                  minSupply = newSupply;
                }
              }
            }
          }

          if (
            result.starterpack.bonusCredits &&
            result.starterpack.bonusCredits > 0
          ) {
            items.push({
              title: `${result.starterpack.bonusCredits} Credits`,
              description: "Credits cover service fee(s).",
              price: 0,
              image: "/ERC-20-Icon.svg",
              type: StarterItemType.CREDIT,
              value: result.starterpack.bonusCredits,
            });
          }

          if (minSupply) {
            setSupply(minSupply);
          }
        }

        setPrice(result.starterpack?.price ?? 0);
        setItems(items);
      })
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [starterpackId]);

  return {
    items,
    price,
    supply,
    isLoading,
    error,
  };
}
