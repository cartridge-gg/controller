import { useAccountProfile } from "@/hooks/account";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Collections, Marketplace } from "@cartridge/arcade";
import { Token, ToriiClient } from "@dojoengine/torii-wasm";
import { useMarketplace } from "@/hooks/marketplace";
import { useConnection } from "@/hooks/connection";
import { addAddressPadding } from "starknet";
import * as torii from "@dojoengine/torii-wasm";
import Torii from "@/helpers/torii";

export const ERC721 = "ERC721";
export const ERC1155 = "ERC1155";
const LIMIT = 10000;

export type Collection = {
  address: string;
  name: string;
  type: string;
  imageUrls: string[];
  totalCount: number;
};

export type Asset = {
  tokenId: string;
  name: string;
  description?: string;
  imageUrls: string[];
  attributes: Record<string, unknown>[];
  owner: string;
  amount?: number;
};

export type UseCollectionResponse = {
  collection?: Collection;
  assets?: Asset[];
  status: "success" | "error" | "idle" | "loading";
  refetch: () => void;
};

export function useCollection({
  contractAddress,
  tokenIds = [],
}: {
  contractAddress?: string;
  tokenIds?: string[];
}): UseCollectionResponse {
  const { address } = useAccountProfile({ overridable: true });
  const { project } = useConnection();

  const [assets, setAssets] = useState<{ [key: string]: Asset }>({});
  const [collection, setCollection] = useState<Collection | undefined>(
    undefined,
  );
  const [trigger, setTrigger] = useState(true);
  const [client, setClient] = useState<torii.ToriiClient | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!project) return;
    Torii.getClient(project).then((client) => setClient(client));
  }, [project]);

  useEffect(() => {
    if (!client || !address || !trigger || !contractAddress) return;
    setTrigger(false);
    const getCollections = async () => {
      const contract = await Torii.fetchContract(client, contractAddress);
      const rawBalances = await Torii.fetchBalances(
        client,
        [contractAddress],
        [address],
        tokenIds.length > 0 ? [...tokenIds] : [],
        LIMIT,
      );
      const balances = rawBalances.items.filter(
        (b) => BigInt(b.balance) !== 0n && BigInt(b.token_id || "0") !== 0n,
      );
      if (balances.length === 0) return;
      const ids = balances
        .filter((b) => BigInt(b.contract_address) === BigInt(contractAddress))
        .map((b) => b.token_id?.replace("0x", ""))
        .filter((b) => b !== undefined);
      if (ids.length === 0) return;
      const collection = await Torii.fetchCollections(
        client,
        [contractAddress],
        ids,
        LIMIT,
      );
      if (collection.items.length === 0) return;
      const asset = collection.items[0];
      let metadata: { name?: string; image?: string } = {};
      try {
        metadata = JSON.parse(!asset.metadata ? "{}" : asset.metadata);
      } catch (error) {
        console.error(error);
      }
      if (!metadata.name || !metadata.image) return;
      const contractImage = `https://api.cartridge.gg/x/${project}/torii/static/${addAddressPadding(contractAddress)}/image`;
      const oldImage = `https://api.cartridge.gg/x/${project}/torii/static/0x${BigInt(contractAddress).toString(16)}/${asset.token_id}/image`;
      const newImage = `https://api.cartridge.gg/x/${project}/torii/static/${addAddressPadding(contractAddress)}/${asset.token_id}/image`;
      const newCollection: Collection = {
        address: contractAddress,
        name: asset.name || metadata.name,
        type: ERC721,
        imageUrls: [contractImage, newImage, oldImage, metadata.image],
        totalCount: ids.length,
      };
      setCollection(newCollection);
      const newAssets: { [key: string]: Asset } = {};
      collection.items
        .filter((asset) => !!asset.token_id)
        .forEach((asset) => {
          let metadata: {
            name?: string;
            image?: string;
            description?: string;
            attributes?: string;
          } = {};
          try {
            metadata = JSON.parse(!asset.metadata ? "{}" : asset.metadata);
          } catch (error) {
            console.error(error);
          }
          const owner = balances.find(
            (b) =>
              !!b?.token_id &&
              b.token_id === asset?.token_id &&
              BigInt(b.balance) !== 0n,
          )?.account_address;
          if (!owner) return; // Skip assets without owners
          const oldImage = `https://api.cartridge.gg/x/${project}/torii/static/0x${BigInt(contractAddress).toString(16)}/${asset.token_id}/image`;
          const newImage = `https://api.cartridge.gg/x/${project}/torii/static/${addAddressPadding(contractAddress)}/${asset.token_id}/image`;
          const balance =
            balances.find(
              (b) =>
                BigInt(b.token_id || "0") === BigInt(asset.token_id || "0"),
            )?.balance || 0;
          newAssets[`${contractAddress}-${asset.token_id || ""}`] = {
            tokenId: asset.token_id || "",
            name: metadata?.name || asset.name,
            description: metadata?.description,
            imageUrls: [newImage, oldImage, metadata?.image || ""],
            attributes: Array.isArray(metadata?.attributes)
              ? metadata.attributes
              : [],
            amount:
              contract.contract_type === ERC1155 ? Number(balance) : undefined,
            owner: owner,
          };
        });
      setAssets(newAssets);
    };
    getCollections();
  }, [client, address, trigger, project, contractAddress, tokenIds]);

  const refetch = useCallback(() => {
    setTrigger(true);
  }, [setTrigger]);

  const filteredAssets = useMemo(() => {
    if (!tokenIds.length) return Object.values(assets);
    const filtered = Object.values(assets).filter((a) =>
      tokenIds.includes(a.tokenId),
    );

    return filtered;
  }, [assets, tokenIds]);

  return {
    collection,
    assets: filteredAssets,
    status: "success",
    refetch,
  };
}

export type UseCollectionsResponse = {
  collections: Collection[];
  status: "success" | "error" | "idle" | "loading";
  refetch: () => void;
};

export type CollectionType = {
  contractAddress: string;
  imagePath: string;
  metadataAttributes: string;
  metadataDescription: string;
  metadataName: string;
  name: string;
  tokenId: string;
  count: number;
};

export function useCollections(): UseCollectionsResponse {
  const { address } = useAccountProfile({ overridable: true });
  const { project } = useConnection();
  const [collections, setCollections] = useState<{ [key: string]: Collection }>(
    {},
  );
  const [client, setClient] = useState<torii.ToriiClient | undefined>(
    undefined,
  );
  const [trigger, setTrigger] = useState(true);

  useEffect(() => {
    if (!project) return;
    Torii.getClient(project).then((client) => setClient(client));
  }, [project]);

  useEffect(() => {
    if (!client || !address || !trigger) return;
    setTrigger(false);
    const getCollections = async () => {
      const contracts = await Torii.fetchContracts(client, [ERC721, ERC1155]);
      const rawBalances = await Torii.fetchBalances(
        client,
        contracts.map((c) => c.contract_address),
        [address],
        [],
        LIMIT,
      );
      const balances = rawBalances.items.filter(
        (b) => BigInt(b.balance) !== 0n && BigInt(b.token_id || "0") !== 0n,
      );
      const contractAddresses = Array.from(
        new Set(balances.map((b) => b.contract_address)),
      );
      const collections: { [key: string]: Collection } = {};
      await Promise.all(
        contractAddresses.map(async (contractAddress) => {
          const tokenIds = balances
            .filter((b) => b.contract_address === contractAddress)
            .map((b) => b.token_id?.replace("0x", ""))
            .filter((b) => b !== undefined);
          if (tokenIds.length === 0) return;
          const collection = await Torii.fetchCollections(
            client,
            [contractAddress],
            tokenIds,
            1,
          );
          if (collection.items.length === 0) return;
          const asset = collection.items[0];
          let metadata: { name?: string; image?: string } = {};
          try {
            metadata = JSON.parse(collection.items[0].metadata || "{}");
          } catch (error) {
            console.error(error);
          }
          const oldImage = `https://api.cartridge.gg/x/${project}/torii/static/0x${BigInt(contractAddress).toString(16)}/${asset.token_id}/image`;
          const newImage = `https://api.cartridge.gg/x/${project}/torii/static/${addAddressPadding(contractAddress)}/${asset.token_id}/image`;
          const type = contracts.find(
            (c) => c.contract_address === contractAddress,
          )?.contract_type;
          collections[contractAddress] = {
            address: contractAddress,
            name: asset.name || metadata?.name || "",
            type: type || "",
            imageUrls: [newImage, oldImage, metadata?.image || ""],
            totalCount: tokenIds.length,
          };
        }),
      );
      setCollections(collections);
    };
    getCollections();
  }, [client, address, project, trigger]);

  const refetch = useCallback(() => {
    setTrigger(true);
  }, [setTrigger]);

  return {
    collections: Object.values(collections).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
    status: "success",
    refetch,
  };
}

export type UseToriiCollectionsResponse = {
  collections: Collections;
  status: "success" | "error" | "idle" | "loading";
  refetch: () => void;
};

export function useToriiCollections(): UseToriiCollectionsResponse {
  const { provider } = useMarketplace();
  const { project } = useConnection();
  const [client, setClient] = useState<ToriiClient | undefined>(undefined);
  const [status, setStatus] = useState<
    "success" | "error" | "idle" | "loading"
  >("idle");
  const [collections, setCollections] = useState<Collections>({});

  const refetch = useCallback(() => {
    if (!client || !project) return;
    setStatus("loading");
    Marketplace.fetchCollections({ [project]: client }, LIMIT)
      .then((collections) => {
        setCollections(collections);
        setStatus("success");
      })
      .catch((error) => {
        setStatus("error");
        console.error(error);
      });
  }, [project, client, setStatus, setCollections]);

  useEffect(() => {
    if (!project) return;
    const getClients = async () => {
      const url = `https://api.cartridge.gg/x/${project}/torii`;
      const client = await provider.getToriiClient(url);
      setClient(client);
    };
    getClients();
  }, [provider, project]);

  useEffect(() => {
    refetch();
  }, [client, refetch]);

  return {
    collections: collections,
    status,
    refetch,
  };
}

export type UseToriiCollectionResponse = {
  tokens: Token[];
  status: "success" | "error" | "idle" | "loading";
  refetch: () => void;
};

export function useToriiCollection({
  contractAddress,
  tokenIds,
}: {
  contractAddress: string;
  tokenIds: string[];
}): UseToriiCollectionResponse {
  const { provider } = useMarketplace();
  const { project } = useConnection();
  const [client, setClient] = useState<ToriiClient | undefined>(undefined);
  const [status, setStatus] = useState<
    "success" | "error" | "idle" | "loading"
  >("idle");
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    if (!project) return;
    const getClient = async () => {
      const url = `https://api.cartridge.gg/x/${project}/torii`;
      const client = await provider.getToriiClient(url);
      setClient(client);
    };
    getClient();
  }, [provider, project]);

  const refetch = useCallback(() => {
    if (!client || !contractAddress || !tokenIds.length) return;
    setStatus("loading");
    client
      .getTokens({
        contract_addresses: [contractAddress],
        token_ids: tokenIds.map((id) =>
          addAddressPadding(id).replace("0x", ""),
        ),
        pagination: {
          limit: LIMIT,
          cursor: undefined,
          direction: "Forward",
          order_by: [],
        },
        attribute_filters: [],
      })
      .then((tokens) => {
        setTokens(tokens.items.filter((token) => !!token.token_id) || []);
        setStatus("success");
      })
      .catch((error) => {
        setStatus("error");
        console.error(error);
      });
  }, [client, setStatus, setTokens, contractAddress, tokenIds]);

  useEffect(() => {
    refetch();
  }, [client, refetch]);

  return {
    tokens: tokens,
    status,
    refetch,
  };
}
