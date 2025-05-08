import { useCallback, useEffect, useState } from "react";
import {
  StarterPackDocument,
  StarterPackQuery,
} from "@cartridge/utils/api/cartridge";
import { client } from "@/utils/graphql";
import { creditsToUSD } from "./tokens";
import { useController } from "./controller";
import { uint256 } from "starknet";

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
  name: string;
  description?: string;
  priceUsd: number;
  supply?: number;
  starterPackItems: StarterItemData[];
}

export function useStarterPack(starterpackId: string) {
  const { controller } = useController();
  const [isLoading, setIsLoading] = useState(true);
  const [supply, setSupply] = useState<number | undefined>(undefined);
  const [items, setItems] = useState<StarterItemData[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [priceUsd, setPriceUsd] = useState<number>(0);

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

      return Number(supply);
    },
    [controller],
  );

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    client
      .request<StarterPackQuery>(StarterPackDocument, { id: starterpackId })
      .then(async (result) => {
        const price = result.starterpack!.price.amount;
        const factor = 10 ** result.starterpack!.price.decimals;
        const priceUSD = creditsToUSD(Number(price) / factor);
        setPriceUsd(priceUSD);
        setName(result.starterpack!.name);
        setDescription(result.starterpack!.description ?? "");

        const items: StarterItemData[] = [];
        if (result.starterpack) {
          let minSupply;
          if (result.starterpack.starterpackContract?.edges) {
            for (const edge of result.starterpack.starterpackContract.edges) {
              items.push({
                title: edge?.node?.name ?? "",
                description: edge?.node?.description ?? "",
                price: priceUSD,
                image: edge?.node?.iconURL ?? "",
                type: StarterItemType.NFT,
              });

              if (edge?.node?.supplyEntryPoint) {
                const newSupply = await checkSupply(
                  edge?.node?.contractAddress,
                  edge?.node?.supplyEntryPoint,
                  edge?.node?.supplyCalldata || [],
                );

                if (!minSupply || newSupply < minSupply) {
                  minSupply = newSupply;
                }
              }
            }
          }

          if (
            result.starterpack.bonusCredits &&
            Number(result.starterpack.bonusCredits.amount) > 0
          ) {
            const factor = 10 ** result.starterpack.bonusCredits.decimals;
            items.push({
              title: `${result.starterpack.bonusCredits} Credits`,
              description: "Credits cover service fee(s).",
              price: 0,
              image: "/ERC-20-Icon.svg",
              type: StarterItemType.CREDIT,
              value: Number(result.starterpack.bonusCredits.amount) / factor,
            });
          }

          if (minSupply !== undefined) {
            setSupply(minSupply);
          }
        }

        setItems(items);
      })
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [starterpackId]);

  return {
    name,
    description,
    items,
    priceUsd,
    supply,
    isLoading,
    error,
  };
}
