import { StarterPackItem } from "@cartridge/controller";
import {
  MintAllowance,
  StarterpackAcquisitionType,
  MerkleDropNetwork,
} from "@cartridge/ui/utils/api/cartridge";

/**
 * Discriminated union for starterpack sources
 */
export type StarterpackSource = "backend" | "onchain";

/**
 * Backend starterpack (existing flow via GraphQL)
 */
export interface BackendStarterpackDetails {
  source: "backend";
  id: string; // UUID from backend
  name: string;
  description?: string;
  priceUsd: number;
  supply?: number;
  mintAllowance?: MintAllowance;
  acquisitionType: StarterpackAcquisitionType;
  starterPackItems: StarterPackItem[];
  merkleDrops?: MerkleDrop[];
}

/**
 * Onchain starterpack (new flow via smart contract)
 */
export interface OnchainStarterpackDetails {
  source: "onchain";
  id: number; // Numeric ID from contract
  name: string;
  description: string;
  imageUri: string;
  items: OnchainItem[];
  quote: OnchainQuote;
  acquisitionType: StarterpackAcquisitionType.Paid;
}

/**
 * Unified starterpack details (discriminated union)
 */
export type StarterpackDetails =
  | BackendStarterpackDetails
  | OnchainStarterpackDetails;

/**
 * Onchain item metadata
 */
export interface OnchainItem {
  name: string;
  description: string;
  imageUri: string;
}

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
export interface OnchainQuote {
  basePrice: bigint;
  referralFee: bigint;
  protocolFee: bigint;
  totalCost: bigint;
  paymentToken: string;
  paymentTokenMetadata: TokenMetadata;
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
export function isBackendStarterpack(
  details: StarterpackDetails | undefined,
): details is BackendStarterpackDetails {
  return details?.source === "backend";
}

export function isOnchainStarterpack(
  details: StarterpackDetails | undefined,
): details is OnchainStarterpackDetails {
  return details?.source === "onchain";
}

/**
 * Detects whether a starterpack ID is for backend or onchain
 * - Numeric IDs (or strings that are purely numeric) → onchain
 * - UUID/string IDs → backend
 */
export function detectStarterpackSource(
  id: string | number | undefined,
): StarterpackSource {
  if (id === undefined) return "backend"; // default

  // If it's already a number, it's onchain
  if (typeof id === "number") return "onchain";

  // If string is purely numeric, it's onchain
  if (/^\d+$/.test(id)) return "onchain";

  // Otherwise it's a backend UUID
  return "backend";
}
