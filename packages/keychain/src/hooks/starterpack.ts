import { useEffect, useState } from "react";
import {
  StarterPackDocument,
  StarterPackQuery,
} from "@cartridge/utils/api/cartridge";
import { client } from "@/utils/graphql";

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
  starterPackItems: StarterItemData[];
}

export function useStarterPack(starterpackId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<StarterItemData[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [price, setPrice] = useState<number>(0);
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    client
      .request<StarterPackQuery>(StarterPackDocument, { id: starterpackId })
      .then((result) => {
        const items: StarterItemData[] = [];

        if (result.starterpack) {
          if (result.starterpack.starterpackContract?.edges) {
            for (const edge of result.starterpack.starterpackContract.edges) {
              items.push({
                title: edge?.node?.name ?? "",
                description: edge?.node?.description ?? "",
                price: formatValue(result.starterpack.price),
                image: edge?.node?.iconURL ?? "",
                type: StarterItemType.NFT,
              });
            }
          }
          if (
            result.starterpack.bonusCredits &&
            parseInt(result.starterpack.bonusCredits) > 0
          ) {
            items.push({
              title: `${result.starterpack.bonusCredits} Credits`,
              description: "Credits cover service fee(s).",
              price: 0,
              image: "/ERC-20-Icon.svg",
              type: StarterItemType.CREDIT,
              value: formatValue(result.starterpack.bonusCredits),
            });
          }
        }

        setPrice(formatValue(result.starterpack?.price ?? "0"));
        setItems(items);
      })
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [starterpackId]);

  return {
    items,
    price,
    isLoading,
    error,
  };
}

const formatValue = (value: string): number => {
  return parseFloat(value) / 10 ** 18;
};
