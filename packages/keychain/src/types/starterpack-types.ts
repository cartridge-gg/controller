import { Item } from "@/context";
import { MerkleDropNetwork } from "@cartridge/ui/utils/api/cartridge";

/**
 * Discriminated union for starterpack sources
 */
export type StarterpackType = "claimed" | "onchain";

/**
 * Backend starterpack (existing flow via GraphQL)
 */
export interface BackendStarterpackDetails {
  type: "claimed";
  id: string; // UUID from backend
  name: string;
  description?: string;
  items: Item[];
  merkleDrops?: MerkleDrop[];
}

/**
 * Onchain starterpack (new flow via smart contract)
 */
export interface OnchainStarterpackDetails {
  type: "onchain";
  id: number; // Numeric ID from contract
  name: string;
  description: string;
  imageUri: string;
  items: Item[];
  quote: Quote | null;
  isQuoteLoading: boolean;
}

/**
 * Unified starterpack details (discriminated union)
 */
export type StarterpackDetails =
  | BackendStarterpackDetails
  | OnchainStarterpackDetails;

/**
 * Token metadata for onchain payments
 */
export interface TokenMetadata {
  symbol: string;
  decimals: number;
}

/**
 * Onchain pricing quote
 */
export interface Quote {
  basePrice: bigint;
  referralFee: bigint;
  protocolFee: bigint;
  totalCost: bigint;
  paymentToken: string;
  paymentTokenMetadata: TokenMetadata;
  // Converted price in target token (e.g., USDC)
  convertedPrice?: {
    amount: bigint;
    token: string;
    tokenMetadata: TokenMetadata;
    priceImpact: number;
  };
}

/**
 * Merkle drop for claims (backend only)
 */
export interface MerkleDrop {
  key: string;
  network: MerkleDropNetwork;
  contract: string;
  entrypoint: string;
  merkleRoot: string;
  description?: string | null;
}

/**
 * Type guards
 */
export function isClaimStarterpack(
  details: StarterpackDetails | undefined,
): details is BackendStarterpackDetails {
  return details?.type === "claimed";
}

export function isOnchainStarterpack(
  details: StarterpackDetails | undefined,
): details is OnchainStarterpackDetails {
  return details?.type === "onchain";
}

/**
 * Detects whether a starterpack ID is for backend or onchain
 * - Numeric IDs (or strings that are purely numeric) → onchain
 * - UUID/string IDs → backend
 */
export function detectStarterpackType(
  id: string | number | undefined,
): StarterpackType {
  if (id === undefined) return "claimed"; // default

  // If it's already a number, it's onchain
  if (typeof id === "number") return "onchain";

  // If string is purely numeric, it's onchain
  if (/^\d+$/.test(id)) return "onchain";

  // Otherwise it's a claimed UUID
  return "claimed";
}
