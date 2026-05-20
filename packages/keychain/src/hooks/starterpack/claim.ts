import { useEffect, useState } from "react";
import {
  MerkleDropNetwork,
  MerkleDropsByKeysDocument,
  MerkleDropsByKeysQuery,
  StarterPackDocument,
  StarterPackQuery,
} from "@cartridge/controller-ui/utils/api/cartridge";
import { client } from "@/utils/graphql";
import { useController } from "@/hooks/controller";
import { Item, ItemType } from "@/context";

export type MerkleDropDisplayOptions = {
  title?: string;
  description?: string;
};

export interface MerkleDrop {
  key: string;
  network: MerkleDropNetwork;
  contract: string;
  entrypoint: string;
  merkleRoot: string;
  description?: string | null;
}

type MerkleDropMetadataItem = {
  name?: string;
  title?: string;
  description?: string;
  image_uri?: string;
  imageUri?: string;
  icon?: string;
  type?: string;
  value?: number;
  quantity?: number;
};

type MerkleDropMetadata = {
  name?: string;
  title?: string;
  description?: string;
  items?: MerkleDropMetadataItem[];
};

function mapItemType(type?: string) {
  switch (type?.toUpperCase()) {
    case ItemType.CREDIT:
      return ItemType.CREDIT;
    case ItemType.ERC20:
      return ItemType.ERC20;
    default:
      return ItemType.NFT;
  }
}

function getMetadata(metadata: unknown): MerkleDropMetadata {
  if (typeof metadata === "string") {
    try {
      return JSON.parse(metadata) as MerkleDropMetadata;
    } catch {
      return {};
    }
  }

  if (!metadata || typeof metadata !== "object") {
    return {};
  }

  return metadata as MerkleDropMetadata;
}

function getMerkleDropItems(
  drops: MerkleDropsByKeysQuery["merkleDropsByKeys"],
) {
  const metadataItems = drops.flatMap((drop) => {
    const metadata = getMetadata(drop.metadata);

    return (metadata.items ?? []).map((item) => ({
      title: item.name ?? item.title ?? drop.description ?? drop.key,
      subtitle: item.description,
      icon: item.image_uri ?? item.imageUri ?? item.icon ?? "/placeholder.svg",
      type: mapItemType(item.type),
      value: item.value,
      quantity: item.quantity,
    }));
  });

  if (metadataItems.length > 0) {
    return metadataItems;
  }

  return drops.map((drop) => ({
    title: drop.description ?? drop.key,
    subtitle: drop.network,
    icon: "/placeholder.svg",
    type: ItemType.NFT,
  }));
}

function getMerkleDropName(
  drops: MerkleDropsByKeysQuery["merkleDropsByKeys"],
  options?: MerkleDropDisplayOptions,
) {
  if (options?.title) {
    return options.title;
  }

  const metadataName = drops
    .map((drop) => {
      const metadata = getMetadata(drop.metadata);
      return metadata.name ?? metadata.title;
    })
    .find(Boolean);

  if (metadataName) {
    return metadataName;
  }

  return drops.length === 1
    ? (drops[0].description ?? "Merkle Drop")
    : "Merkle Drops";
}

function getMerkleDropDescription(
  drops: MerkleDropsByKeysQuery["merkleDropsByKeys"],
  options?: MerkleDropDisplayOptions,
) {
  if (options?.description) {
    return options.description;
  }

  return (
    drops.map((drop) => getMetadata(drop.metadata).description).find(Boolean) ??
    ""
  );
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

export function useClaimMerkleDrops(
  keys: string[] | undefined,
  options?: MerkleDropDisplayOptions,
) {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [name, setName] = useState<string>(options?.title ?? "");
  const [description, setDescription] = useState<string>(
    options?.description ?? "",
  );
  const [merkleDrops, setMerkleDrops] = useState<MerkleDrop[]>([]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    if (!keys?.length) {
      setName(options?.title ?? "");
      setDescription(options?.description ?? "");
      setItems([]);
      setMerkleDrops([]);
      setIsLoading(false);
      return;
    }

    client
      .request<MerkleDropsByKeysQuery>(MerkleDropsByKeysDocument, { keys })
      .then((result) => {
        const drops = result.merkleDropsByKeys;

        if (!drops.length) {
          throw new Error("No merkle drops found");
        }

        setName(getMerkleDropName(drops, options));
        setDescription(getMerkleDropDescription(drops, options));
        setItems(getMerkleDropItems(drops));
        setMerkleDrops(
          drops
            .map((drop) => ({
              key: drop.key,
              network: drop.network,
              contract: drop.contract,
              entrypoint: drop.entrypoint,
              merkleRoot: drop.merkleRoot,
              description: drop.description,
            }))
            .sort((a, b) => a.network.localeCompare(b.network)),
        );
      })
      .catch((error) => {
        setError(error as Error);
      })
      .finally(() => setIsLoading(false));
  }, [keys, options]);

  return {
    name,
    description,
    items,
    merkleDrops,
    isLoading,
    error,
  };
}
