import { useEffect, useState } from "react";
import {
  MerkleDropNetwork,
  MerkleDropsByKeysDocument,
  MerkleDropsByKeysQuery,
} from "@cartridge/controller-ui/utils/api/cartridge";
import { client } from "@/utils/graphql";
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
