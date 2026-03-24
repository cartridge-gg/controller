import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import {
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
  const [starterpackDetails, setStarterpackDetails] = useState<
    StarterpackDetails | undefined
  >();
  const [transactionHash, setTransactionHash] = useState<string | undefined>();
  const [displayError, setDisplayError] = useState<Error | undefined>();
  const [claimItemsState, setClaimItemsState] = useState<Item[]>([]);

  // Detect which source (claimed or onchain) based on starterpack ID
  const type = detectStarterpackType(starterpackId ?? bundleId);

  // Claim hook (GraphQL) - only run if claimed source
  const {
    name: claimName,
    items: claimHookItems,
    merkleDrops,
    isLoading: isClaimLoading,
    error: claimError,
  } = useClaimStarterpack(
    type === "claimed" && starterpackId !== undefined
      ? String(starterpackId)
      : undefined,
  );

  // Onchain hook (Smart contract) - only run if onchain source
  const isStarterPack = type === "onchain" && starterpackId !== undefined;
  const isBundle = type === "onchain" && bundleId !== undefined;

  const {
    metadata: onchainMetadata,
    quote: onchainQuote,
    isLoading: isOnchainLoading,
    isQuoteLoading: isOnchainQuoteLoading,
    error: onchainError,
  } = useOnchainStarterpack({
    starterpackId: isStarterPack
      ? Number(starterpackId)
      : isBundle
        ? Number(bundleId)
        : undefined,
    registryAddress,
    isBundle,
  });

  // Unified loading and error state
  const isStarterpackLoading =
    type === "claimed" ? isClaimLoading : isOnchainLoading;
  const starterpackError = type === "claimed" ? claimError : onchainError;

  // Transform data based on source (claimed vs onchain)
  useEffect(() => {
    if (starterpackId === undefined) return;

    if (type === "claimed") {
      setStarterpackDetails({
        type: "claimed",
        id: String(starterpackId),
        name: claimName,
        items: claimHookItems,
        merkleDrops,
      });
    } else if (type === "onchain" && onchainMetadata) {
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
        id: Number(starterpackId),
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
    starterpackId,
    type,
    // Claim dependencies
    claimName,
    claimHookItems,
    merkleDrops,
    // Onchain dependencies
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
    },
    [],
  );

  const setStarterpack = useCallback(
    (id: number | string, registryAddress: string) => {
      setStarterpackId(id);
      setRegistryAddress(registryAddress);
      setBundleId(undefined);
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
