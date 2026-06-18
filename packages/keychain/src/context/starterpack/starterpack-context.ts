import { createContext, ReactNode } from "react";
import { MerkleDropDisplayOptions } from "@/hooks/starterpack";
import { SocialClaimConditions } from "@/hooks/starterpack/bundle";
import { SocialClaimOptions } from "@cartridge/controller";
import { StarterpackDetails, Item } from "./types";

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
