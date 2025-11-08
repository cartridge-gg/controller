import {
  StarterpackAcquisitionType,
} from "@cartridge/ui/utils/api/cartridge";

/**
 * Onchain starterpack (smart contract flow)
 * Supports both paid and future free acquisition types
 */
export interface OnchainStarterpackDetails {
  id: number; // Numeric ID from contract
  name: string;
  description: string;
  imageUri: string;
  items: OnchainItem[];
  quote: OnchainQuote | null;
  isQuoteLoading: boolean;
  acquisitionType: StarterpackAcquisitionType;
}

/**
 * Starterpack details - currently only onchain starterpacks
 * Merkle claims use a separate flow via useMerkleClaim hook
 */
export type StarterpackDetails = OnchainStarterpackDetails;

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
  // Converted price in target token (e.g., USDC)
  convertedPrice?: {
    amount: bigint;
    token: string;
    tokenMetadata: TokenMetadata;
    priceImpact: number;
  };
}

/**
 * Type guard for onchain starterpacks
 * Currently all starterpacks are onchain, so this always returns true if details exist
 */
export function isOnchainStarterpack(
  details: StarterpackDetails | undefined,
): details is OnchainStarterpackDetails {
  return details !== undefined;
}
