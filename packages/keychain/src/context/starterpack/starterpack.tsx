import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import {
  MerkleDropDisplayOptions,
  useClaimMerkleDrops,
  useClaimStarterpack,
  useOnchainStarterpack,
} from "@/hooks/starterpack";
import {
  StarterpackDetails,
  detectStarterpackType,
  Item,
  ItemType,
} from "./types";
import {
  useBundleConditions,
  SocialClaimConditions,
} from "@/hooks/starterpack/bundle";
import { SocialClaimOptions } from "@cartridge/controller";

export interface StarterpackContextType {
  // Registry contract address
  registryAddress: string | undefined;

  // Bundle identification (starterpack V2)
  bundleId: number | undefined;
  setBundle: (
    id: number,
    registryAddress: string,
    socialClaimOptions?: SocialClaimOptions,
  ) => void;

  // Starterpack identification
  starterpackId: string | number | undefined;
  setStarterpack: (id: string | number, registryAddress: string) => void;

  // Merkle drop identification
  merkleDropKeys: string[] | undefined;
  setMerkleDrops: (keys: string[], options?: MerkleDropDisplayOptions) => void;

  // Starterpack details (loaded from backend or onchain)
  starterpackDetails: StarterpackDetails | undefined;
  isStarterpackLoading: boolean;

  // Claim items (can be enriched with quantities for display)
  claimItems: Item[];
  setClaimItems: (items: Item[]) => void;

  // Transaction state
  transactionHash: string | undefined;
  setTransactionHash: (hash: string) => void;

  // Error handling
  displayError: Error | undefined;
  setDisplayError: (error: Error | undefined) => void;
  clearError: () => void;

  // Conditional bundles info
  socialClaimOptions: SocialClaimOptions | undefined;
  socialClaimConditions: SocialClaimConditions | undefined;
}

export const StarterpackContext = createContext<
  StarterpackContextType | undefined
>(undefined);

export interface StarterpackProviderProps {
  children: ReactNode;
}

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
  const isClaimed =
    !isMerkleDrops && type === "claimed" && starterpackId !== undefined;
  const isStarterPack = type === "onchain" && starterpackId !== undefined;
  const isBundle = type === "onchain" && bundleId !== undefined;

  const claimId = isClaimed ? String(starterpackId) : undefined;

  const onchainId = isStarterPack
    ? Number(starterpackId)
    : isBundle
      ? Number(bundleId)
      : undefined;

  // Claim hook (GraphQL) - only run if claimed source
  const {
    name: claimName,
    items: claimHookItems,
    merkleDrops,
    isLoading: isClaimLoading,
    error: claimError,
  } = useClaimStarterpack(claimId);

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
    : type === "claimed"
      ? isClaimLoading
      : isOnchainLoading;
  const starterpackError = isMerkleDrops
    ? merkleDropError
    : type === "claimed"
      ? claimError
      : onchainError;

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
    } else if (claimId !== undefined) {
      setStarterpackDetails({
        type: "claimed",
        id: claimId,
        name: claimName,
        items: claimHookItems,
        merkleDrops,
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
    // Claim dependencies
    isMerkleDrops,
    merkleDropKeys,
    merkleDropName,
    merkleDropDescription,
    merkleDropItems,
    claimMerkleDrops,
    claimId,
    claimName,
    claimHookItems,
    merkleDrops,
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

export const useStarterpackContext = () => {
  const context = useContext(StarterpackContext);
  if (!context) {
    throw new Error(
      "useStarterpackContext must be used within StarterpackProvider",
    );
  }
  return context;
};
