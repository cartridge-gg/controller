import { useIndexerAPI } from "@cartridge/utils";
import { useAccount } from "./account";
import {
  Erc721__Token,
  useErc721BalancesQuery,
} from "@cartridge/utils/api/indexer";
import { useMemo, useState } from "react";

const LIMIT = 1000;

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

export type UseCollectionResponse = {
  collection?: Collection;
  assets?: Asset[];
  status: "success" | "error" | "idle" | "loading";
};

export function useCollection({
  contractAddress,
  tokenIds = [],
}: {
  contractAddress?: string;
  tokenIds?: string[];
}): UseCollectionResponse {
  const { address } = useAccount();
  const { isReady, indexerUrl } = useIndexerAPI();
  const [offset, setOffset] = useState(0);
  const [tokens, setTokens] = useState<{ [key: string]: Erc721__Token }>({});

  const { status } = useErc721BalancesQuery(
    { address, limit: LIMIT, offset: offset },
    {
      queryKey: ["tokenBalances", offset],
      enabled: isReady && !!address,
      onSuccess: ({ tokenBalances }) => {
        const newTokens: { [key: string]: Erc721__Token } = {};
        tokenBalances?.edges
          .filter(
            (e) =>
              !contractAddress ||
              (e.node.tokenMetadata as Erc721__Token).contractAddress ===
                contractAddress,
          )
          .filter(
            (e) =>
              !tokenIds.length ||
              tokenIds.includes(
                (e.node.tokenMetadata as Erc721__Token).tokenId,
              ),
          )
          .forEach((e) => {
            const token = e.node.tokenMetadata as Erc721__Token;
            newTokens[`${token.contractAddress}-${token.tokenId}`] = token;
          });
        if (tokenBalances?.edges.length === LIMIT) {
          setOffset(offset + LIMIT);
        }
        setTokens((prev) => ({ ...prev, ...newTokens }));
      },
    },
  );

  const { collection, assets } = useMemo<{
    collection?: Collection;
    assets?: Asset[];
  }>(() => {
    if (!indexerUrl || !Object.values(tokens).length) return {};

    const assets = Object.values(tokens).map((token) => {
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
        imageUrl: token.imagePath
          ? `${indexerUrl.replace("/graphql", "")}/static/${token.imagePath}`
          : "",
        attributes,
      };
    });

    const collection = {
      address: Object.values(tokens)[0].contractAddress,
      name: Object.values(tokens)[0].name,
      type: "ERC-721",
      imageUrl: assets[0].imageUrl,
      totalCount: assets.length,
    };

    return {
      collection,
      assets,
    };
  }, [tokens, indexerUrl]);

  return { collection, assets, status };
}

export type UseCollectionsResponse = {
  collections: Collection[];
  status: "success" | "error" | "idle" | "loading";
};

export function useCollections(): UseCollectionsResponse {
  const { address } = useAccount();
  const { isReady, indexerUrl } = useIndexerAPI();

  const [offset, setOffset] = useState(0);
  const [tokens, setTokens] = useState<{ [key: string]: Erc721__Token }>({});
  const { status } = useErc721BalancesQuery(
    { address, limit: LIMIT, offset: offset },
    {
      queryKey: ["tokenBalances", offset],
      enabled: isReady && !!address,
      onSuccess: ({ tokenBalances }) => {
        const newTokens: { [key: string]: Erc721__Token } = {};
        tokenBalances?.edges.forEach((e) => {
          const token = e.node.tokenMetadata as Erc721__Token;
          newTokens[`${token.contractAddress}-${token.tokenId}`] = token;
        });
        if (tokenBalances?.edges.length === LIMIT) {
          setOffset(offset + LIMIT);
        }
        setTokens((prev) => ({ ...prev, ...newTokens }));
      },
    },
  );

  const collections = useMemo(() => {
    if (!indexerUrl || !Object.values(tokens).length) return [];

    const collections =
      Object.values(tokens).reduce<Record<string, Collection>>(
        (prev, token) => {
          const agg = prev[token.contractAddress];
          const collection = agg
            ? { ...agg, totalCount: agg.totalCount + 1 }
            : {
                address: token.contractAddress,
                name: token.name,
                totalCount: 1,
                imageUrl: token.imagePath
                  ? `${indexerUrl.replace("/graphql", "")}/static/${token.imagePath}`
                  : "",
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
  }, [tokens, indexerUrl]);

  return { collections, status };
}
