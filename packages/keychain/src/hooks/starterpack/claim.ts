import { useEffect, useState } from "react";
import {
  MerkleDropNetwork,
  StarterPackDocument,
  StarterPackQuery,
} from "@cartridge/ui/utils/api/cartridge";
import { client } from "@/utils/graphql";
import { useController } from "@/hooks/controller";
import { Item, ItemType } from "@/context";

export interface MerkleDrop {
  key: string;
  network: MerkleDropNetwork;
  contract: string;
  entrypoint: string;
  merkleRoot: string;
  description?: string | null;
}

export function useClaimStarterpack(starterpack: string | undefined) {
  const { controller } = useController();
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [merkleDrops, setMerkleDrops] = useState<MerkleDrop[]>([]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    if (!controller || !starterpack) {
      setIsLoading(false);
      return;
    }

    client
      .request<StarterPackQuery>(StarterPackDocument, {
        input: {
          starterpackId: starterpack,
          accountId: controller?.username(),
        },
      })
      .then(async (result) => {
        const details = result.starterpack!;
        setName(details.starterpack!.name);
        setDescription(details.starterpack!.description ?? "");

        const items: Item[] = [];
        if (details.starterpack) {
          // This needs to come from merkle drop metadata
          if (details.starterpack.starterpackContract?.edges) {
            for (const edge of details.starterpack.starterpackContract.edges) {
              items.push({
                title: edge?.node?.name ?? "",
                subtitle: edge?.node?.description ?? "",
                icon: edge?.node?.iconURL || "/placeholder.svg",
                type: ItemType.NFT,
              });
            }
          }

          if (Number(details.bonusCredits.amount) > 0) {
            const factor = 10 ** details.bonusCredits.decimals;
            items.push({
              title: `${details.bonusCredits.amount} Credits`,
              subtitle: "Credits cover service fee(s).",
              icon: "/ERC-20-Icon.svg",
              type: ItemType.CREDIT,
              value: Number(details.bonusCredits.amount) / factor,
            });
          }
        }

        setItems(items);

        if (!details.starterpack!.merkleDrops?.edges?.length) {
          throw new Error(
            "No merkle drop snapshots associated with this starterpack",
          );
        }

        const drops: MerkleDrop[] = details.starterpack.merkleDrops.edges
          .filter((edge): edge is NonNullable<typeof edge> => edge !== null)
          .map((edge) => {
            if (!edge.node) return null;
            return {
              key: edge.node.key,
              network: edge.node.network,
              contract: edge.node.contract,
              entrypoint: edge.node.entrypoint,
              merkleRoot: edge.node.merkleRoot,
              description: edge.node.description,
            };
          })
          .filter((drop): drop is NonNullable<typeof drop> => drop !== null)
          .sort((a, b) => a.network.localeCompare(b.network));

        setMerkleDrops(drops);
      })
      .catch((error) => {
        if (error.message && error.message.includes("Starterpack not found")) {
          setError(new Error("Starterpack not found"));
        } else {
          setError(error as Error);
        }
      })
      .finally(() => setIsLoading(false));
  }, [controller, starterpack]);

  return {
    name,
    description,
    items,
    merkleDrops,
    isLoading,
    error,
  };
}
