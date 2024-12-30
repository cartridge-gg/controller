import { useIndexerAPI } from "@cartridge/utils";
import { useAccount } from "./account";
import {
  Erc721__Token,
  useErc721BalancesQuery,
} from "@cartridge/utils/api/indexer";
import { useMemo } from "react";

export type Collection = {
  address: string;
  name: string;
  type: string;
  imageUrl: string;
  totalCount: number;
};

export type Asset = {
  tokenId: string;
  name: string;
  description?: string;
  imageUrl: string;
  attributes: Record<string, unknown>[];
};

export function useCollection({ tokenIds = [] }: { tokenIds?: string[] }) {
  const { address } = useAccount();
  const { isReady, indexerUrl } = useIndexerAPI();
  const { status, data } = useErc721BalancesQuery(
    { address },
    { enabled: isReady && !!address },
  );

  const { collection, assets } = useMemo<{
    collection?: Collection;
    assets?: Asset[];
  }>(() => {
    const tokens = data?.tokenBalances?.edges
      .filter((e) =>
        !tokenIds.length
          ? true
          : tokenIds.includes((e.node.tokenMetadata as Erc721__Token).tokenId),
      )
      .map((e) => e.node.tokenMetadata as Erc721__Token);
    if (!indexerUrl || !tokens) {
      return {};
    }

    const assets = tokens.map((token) => {
      let attributes;
      try {
        attributes = JSON.parse(token.metadataAttributes);
      } catch {
        console.log("Failed to parse attributes");
      }
      return {
        tokenId: token.tokenId,
        name: token.metadataName,
        description: token.metadataDescription,
        imageUrl: `${indexerUrl.replace("/graphql", "")}/static/${
          token?.imagePath
        }`,
        attributes,
      };
    });

    const collection = {
      address: tokens[0].contractAddress,
      name: tokens[0].name,
      type: "ERC-721",
      imageUrl: assets[0].imageUrl,
      totalCount: assets.length,
    };

    return {
      collection,
      assets,
    };
  }, [data, indexerUrl]);

  return { collection, assets, status };
}

export function useCollections() {
  const { address } = useAccount();
  const { isReady, indexerUrl } = useIndexerAPI();
  const { status, data } = useErc721BalancesQuery(
    { address },
    { enabled: isReady && !!address },
  );

  const collections = useMemo(() => {
    if (!data || !indexerUrl) return [];

    const collections =
      data.tokenBalances?.edges.reduce<Record<string, Collection>>(
        (prev, edge) => {
          const token = edge.node.tokenMetadata as Erc721__Token;
          const agg = prev[token.contractAddress];
          const collection = agg
            ? { ...agg, totalCount: agg.totalCount + 1 }
            : {
                address: token.contractAddress,
                name: token.name,
                totalCount: 1,
                imageUrl: `${indexerUrl.replace("/graphql", "")}/static/${
                  token.imagePath
                }`,
                type: "ERC-721",
              };

          return {
            ...prev,
            [collection.address]: collection,
          };
        },
        {},
      ) ?? [];

    return Object.values(collections);
  }, [data, indexerUrl]);

  return { collections, status };
}
