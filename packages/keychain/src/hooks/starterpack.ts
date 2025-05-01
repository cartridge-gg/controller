import { useEffect, useState } from "react";
import {
  StarterPackDocument,
  StarterPackQuery,
} from "@cartridge/utils/api/cartridge";
import { client } from "@/utils/graphql";
import { creditsToUSD } from "./tokens";
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
  priceUsd: number;
  starterPackItems: StarterItemData[];
}

export function useStarterPack(starterpackId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<StarterItemData[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [priceUsd, setPriceUsd] = useState<number>(0);
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    client
      .request<StarterPackQuery>(StarterPackDocument, { id: starterpackId })
      .then((result) => {
        const price = result.starterpack!.price.amount;
        const factor = 10 ** result.starterpack!.price.decimals;
        const priceUSD = creditsToUSD(Number(price) / factor);
        setPriceUsd(priceUSD);

        const items: StarterItemData[] = [];
        if (result.starterpack) {
          if (result.starterpack.starterpackContract?.edges) {
            for (const edge of result.starterpack.starterpackContract.edges) {
              items.push({
                title: edge?.node?.name ?? "",
                description: edge?.node?.description ?? "",
                price: priceUSD,
                image: edge?.node?.iconURL ?? "",
                type: StarterItemType.NFT,
              });
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
        }

        setItems(items);
      })
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [starterpackId]);

  return {
    items,
    priceUsd,
    isLoading,
    error,
  };
}
