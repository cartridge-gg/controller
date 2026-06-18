import { useState, useCallback, useEffect } from "react";
import {
  MerkleDropDisplayOptions,
  useClaimMerkleDrops,
  useOnchainStarterpack,
} from "@/hooks/starterpack";
import {
  StarterpackDetails,
  detectStarterpackType,
  Item,
  ItemType,
} from "./types";
import { useBundleConditions } from "@/hooks/starterpack/bundle";
import { SocialClaimOptions } from "@cartridge/controller";
import {
  StarterpackContext,
  StarterpackContextType,
  StarterpackProviderProps,
} from "./starterpack-context";

export const StarterpackProvider = ({ children }: StarterpackProviderProps) => {
  const [registryAddress, setRegistryAddress] = useState<string | undefined>();
  const [bundleId, setBundleId] = useState<number | undefined>();
  const [starterpackId, setStarterpackId] = useState<string | number>();
  const [merkleDropKeys, setMerkleDropKeys] = useState<string[] | undefined>();
  const [merkleDropOptions, setMerkleDropOptions] = useState<
    MerkleDropDisplayOptions | undefined
  >();
  const [starterpackDetails, setStarterpackDetails] = useState<
    StarterpackDetails | undefined
  >();
  const [transactionHash, setTransactionHash] = useState<string | undefined>();
  const [displayError, setDisplayError] = useState<Error | undefined>();
  const [claimItemsState, setClaimItemsState] = useState<Item[]>([]);

  // Detect which source (claimed or onchain) based on starterpack ID
  const type = detectStarterpackType(starterpackId ?? bundleId);

  const isMerkleDrops = merkleDropKeys !== undefined;
  const isStarterPack = type === "onchain" && starterpackId !== undefined;
  const isBundle = type === "onchain" && bundleId !== undefined;

  const onchainId = isStarterPack
    ? Number(starterpackId)
    : isBundle
      ? Number(bundleId)
      : undefined;

  const {
    name: merkleDropName,
    description: merkleDropDescription,
    items: merkleDropItems,
    merkleDrops: claimMerkleDrops,
    isLoading: isMerkleDropLoading,
    error: merkleDropError,
  } = useClaimMerkleDrops(merkleDropKeys, merkleDropOptions);

  // Onchain hook (Smart contract) - only run if onchain source
  const {
    metadata: onchainMetadata,
    quote: onchainQuote,
    isLoading: isOnchainLoading,
    isQuoteLoading: isOnchainQuoteLoading,
    error: onchainError,
  } = useOnchainStarterpack({
    onchainId,
    registryAddress,
    isBundle,
  });

  // Unified loading and error state
  const isStarterpackLoading = isMerkleDrops
    ? isMerkleDropLoading
    : isOnchainLoading;
  const starterpackError = isMerkleDrops ? merkleDropError : onchainError;

  // Transform data based on source (claimed vs onchain)
  useEffect(() => {
    if (isMerkleDrops) {
      setStarterpackDetails({
        type: "claimed",
        id: merkleDropKeys!.join(";"),
        name: merkleDropName,
        description: merkleDropDescription,
        items: merkleDropItems,
        merkleDrops: claimMerkleDrops,
      });
    } else if (onchainId !== undefined && onchainMetadata) {
      // Onchain flow - show metadata as soon as it's available
      const purchaseItems: Item[] = onchainMetadata.items.map((item) => ({
        title: item.name,
        subtitle: item.description,
        icon: item.imageUri,
        value: 0, // Will be calculated from quote
        type: ItemType.NFT,
      }));

      setStarterpackDetails({
        type: "onchain",
        id: onchainId,
        name: onchainMetadata.name,
        description: onchainMetadata.description,
        imageUri: onchainMetadata.imageUri,
        items: purchaseItems,
        quote: onchainQuote,
        isQuoteLoading: isOnchainQuoteLoading,
        additionalPaymentTokens: onchainMetadata.additionalPaymentTokens,
        isConditional: (onchainMetadata.conditions ?? []).length > 0,
      });
    }
  }, [
    // Merkle drop dependencies
    isMerkleDrops,
    merkleDropKeys,
    merkleDropName,
    merkleDropDescription,
    merkleDropItems,
    claimMerkleDrops,
    // Onchain dependencies
    onchainId,
    onchainMetadata,
    onchainQuote,
    isOnchainQuoteLoading,
  ]);

  // conditional bundles
  const [socialClaimOptions, setSocialClaimOptions] = useState<
    SocialClaimOptions | undefined
  >();
  const { socialClaimConditions } = useBundleConditions(onchainMetadata);

  const setBundle = useCallback(
    (
      id: number,
      registryAddress: string,
      socialClaimOptions?: SocialClaimOptions,
    ) => {
      setBundleId(id);
      setRegistryAddress(registryAddress);
      setSocialClaimOptions(socialClaimOptions);
      setStarterpackId(undefined);
      setMerkleDropKeys(undefined);
      setMerkleDropOptions(undefined);
    },
    [],
  );

  const setStarterpack = useCallback(
    (id: number | string, registryAddress: string) => {
      setStarterpackId(id);
      setRegistryAddress(registryAddress);
      setBundleId(undefined);
      setSocialClaimOptions(undefined);
      setMerkleDropKeys(undefined);
      setMerkleDropOptions(undefined);
    },
    [],
  );

  const setMerkleDrops = useCallback(
    (keys: string[], options?: MerkleDropDisplayOptions) => {
      setMerkleDropKeys(keys);
      setMerkleDropOptions(options);
      setStarterpackId(undefined);
      setBundleId(undefined);
      setRegistryAddress(undefined);
      setSocialClaimOptions(undefined);
    },
    [],
  );

  // Sync errors from hooks to displayError
  useEffect(() => {
    if (starterpackError) {
      setDisplayError(starterpackError);
    }
  }, [starterpackError]);

  const clearError = useCallback(() => {
    setDisplayError(undefined);
  }, []);

  // Claim items: use enriched state if set, otherwise fall back to starterpack items
  const claimItems =
    claimItemsState.length > 0
      ? claimItemsState
      : (starterpackDetails?.items ?? []);

  const setClaimItems = useCallback((items: Item[]) => {
    setClaimItemsState(items);
  }, []);

  const contextValue: StarterpackContextType = {
    setBundle,
    setStarterpack,
    registryAddress,
    bundleId,
    starterpackId,
    merkleDropKeys,
    setMerkleDrops,
    starterpackDetails,
    isStarterpackLoading,
    claimItems,
    setClaimItems,
    transactionHash,
    setTransactionHash,
    displayError,
    setDisplayError,
    clearError,
    socialClaimOptions,
    socialClaimConditions,
  };

  return (
    <StarterpackContext.Provider value={contextValue}>
      {children}
    </StarterpackContext.Provider>
  );
};
