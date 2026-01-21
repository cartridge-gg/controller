import { MerkleDropNetwork } from "@cartridge/ui/utils/api/cartridge";

/**
 * Item types for starterpack items
 */
export enum ItemType {
  CREDIT = "CREDIT",
  ERC20 = "ERC20",
  NFT = "NFT",
}

/**
 * Item in a starterpack
 */
export type Item = {
  title: string;
  subtitle?: string;
  icon: string | React.ReactNode;
  value?: number;
  quantity?: number;
  type: ItemType;
};

/**
 * Payment method type
 */
export type PaymentMethod = "stripe" | "crypto" | "apple-pay";

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
  additionalPaymentTokens?: string[]; // Additional payment token addresses beyond ETH/STRK/USDC
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
  // Converted price in target token
  convertedPrice?: {
    amount: bigint;
    token: string;
    tokenMetadata: TokenMetadata;
    priceImpact: number;
  };
  // USDC-denominated price (for USD display)
  usdcPrice?: bigint;
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
