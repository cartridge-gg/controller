import { useCallback, useEffect, useState } from "react";
import {
  ClaimFreeStarterpackDocument,
  ClaimFreeStarterpackMutation,
  MerkleDrop,
  StarterpackAcquisitionType,
  StarterPackDocument,
  StarterpackInput,
  StarterPackQuery,
} from "@cartridge/ui/utils/api/cartridge";
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
  mintAllowance?: MintAllowance;
  acquisitionType: StarterpackAcquisitionType;
  starterPackItems: StarterItemData[];
}

export interface MintAllowance {
  count: number;
  limit: number;
}

export function useStarterPack(starterpackId?: string) {
  const { controller } = useController();
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [supply, setSupply] = useState<number | undefined>(undefined);
  const [items, setItems] = useState<StarterItemData[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [priceUsd, setPriceUsd] = useState<number>(0);
  const [acquisitionType, setAcquisitionType] =
    useState<StarterpackAcquisitionType>(StarterpackAcquisitionType.Paid);
  const [merkleDrop, setMerkleDrop] = useState<MerkleDrop | undefined>(
    undefined,
  );
  const [mintAllowance, setMintAllowance] = useState<MintAllowance | undefined>(
    undefined,
  );

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

    if (!controller || !starterpackId) {
      setIsLoading(false);
      return;
    }

    client
      .request<StarterPackQuery>(StarterPackDocument, {
        input: {
          starterpackId: starterpackId,
          accountId: controller?.username(),
        },
      })
      .then(async (result) => {
        const details = result.starterpack!;
        const price = details.price.amount;
        const factor = 10 ** details.price.decimals;
        const priceUSD = creditsToUSD(Number(price) / factor);
        setAcquisitionType(details.acquisitionType);
        setPriceUsd(priceUSD);
        setName(details.starterpack!.name);
        setDescription(details.starterpack!.description ?? "");

        if (details.mintAllowance) {
          setMintAllowance(details.mintAllowance);
        }

        const items: StarterItemData[] = [];
        if (details.starterpack) {
          let minSupply;
          if (details.starterpack.starterpackContract?.edges) {
            for (const edge of details.starterpack.starterpackContract.edges) {
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

          if (Number(details.bonusCredits.amount) > 0) {
            const factor = 10 ** details.bonusCredits.decimals;
            items.push({
              title: `${details.bonusCredits} Credits`,
              description: "Credits cover service fee(s).",
              price: 0,
              image: "/ERC-20-Icon.svg",
              type: StarterItemType.CREDIT,
              value: Number(details.bonusCredits.amount) / factor,
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
  }, [starterpackId, controller, checkSupply]);

  const claim = useCallback(async () => {
    if (!controller || !starterpackId) {
      throw new Error("Controller or starterpack ID not found");
    }

    setIsClaiming(true);
    setError(null);

    const input: StarterpackInput = {
      starterpackId: starterpackId,
      accountId: controller.username(),
    };

    try {
      const { claimFreeStarterpack: trannsactionHash } =
        await client.request<ClaimFreeStarterpackMutation>(
          ClaimFreeStarterpackDocument,
          {
            input: input,
          },
        );

      return trannsactionHash;
    } catch (error) {
      console.error(error);
      setError(error as Error);
      throw error;
    } finally {
      setIsClaiming(false);
    }
  }, [starterpackId, controller]);

  return {
    name,
    description,
    items,
    priceUsd,
    supply,
    mintAllowance,
    acquisitionType,
    isLoading,
    isClaiming,
    error,
    claim,
  };
}
