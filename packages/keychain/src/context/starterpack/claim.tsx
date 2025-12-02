import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Item } from "./types";
import { useStarterpackContext } from "./starterpack";

export interface ClaimContextType {
  // Claim items (can be enriched with quantities)
  claimItems: Item[];
  setClaimItems: (items: Item[]) => void;

  // Convenience re-exports from starterpack context
  transactionHash: string | undefined;
  setTransactionHash: (hash: string) => void;
}

export const ClaimContext = createContext<ClaimContextType | undefined>(
  undefined,
);

export interface ClaimProviderProps {
  children: ReactNode;
}

export const ClaimProvider = ({ children }: ClaimProviderProps) => {
  const { starterpackDetails, transactionHash, setTransactionHash } =
    useStarterpackContext();

  // Use items from starterpack details as initial state, allow enrichment
  const [claimItemsState, setClaimItemsState] = useState<Item[]>([]);

  // Merge starterpack items with any enriched items
  const claimItems =
    claimItemsState.length > 0
      ? claimItemsState
      : (starterpackDetails?.items ?? []);

  const setClaimItems = useCallback((items: Item[]) => {
    setClaimItemsState(items);
  }, []);

  const contextValue: ClaimContextType = {
    claimItems,
    setClaimItems,
    transactionHash,
    setTransactionHash,
  };

  return (
    <ClaimContext.Provider value={contextValue}>
      {children}
    </ClaimContext.Provider>
  );
};

export const useClaimContext = () => {
  const context = useContext(ClaimContext);
  if (!context) {
    throw new Error("useClaimContext must be used within ClaimProvider");
  }
  return context;
};
