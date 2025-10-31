import { USDC_CONTRACT_ADDRESS } from "@cartridge/ui/utils";

/**
 * Normalize a token address for comparison
 * - Convert to lowercase
 * - Remove leading zeros after 0x prefix
 */
export function normalizeTokenAddress(address: string): string {
  const lower = address.toLowerCase();
  if (lower.startsWith("0x")) {
    // Remove leading zeros after 0x, but keep at least one digit
    const withoutPrefix = lower.slice(2).replace(/^0+/, "") || "0";
    return `0x${withoutPrefix}`;
  }
  return lower;
}

/**
 * Get the number of decimals for a token address
 * USDC = 6 decimals, everything else = 18 decimals
 */
export function getTokenDecimals(tokenAddress: string): number {
  return normalizeTokenAddress(tokenAddress) === USDC_CONTRACT_ADDRESS ? 6 : 18;
}

/**
 * Convert a BigInt token amount to a decimal number
 */
export function tokenAmountToDecimal(
  amount: bigint,
  tokenAddress: string,
): number {
  const decimals = getTokenDecimals(tokenAddress);
  const divisor = BigInt(10 ** decimals);
  return Number(amount) / Number(divisor);
}

/**
 * Convert a token amount to USD string (assumes token is a stablecoin or USD-pegged)
 * For USDC and other stablecoins, 1 token = $1 USD
 */
export function tokenAmountToUsd(amount: bigint, tokenAddress: string): string {
  const decimalAmount = tokenAmountToDecimal(amount, tokenAddress);
  return `$${decimalAmount.toFixed(2)}`;
}

/**
 * Get a human-readable token symbol from address
 */
export function getTokenSymbol(tokenAddress: string): string {
  if (normalizeTokenAddress(tokenAddress) === USDC_CONTRACT_ADDRESS) {
    return "USDC";
  }
  // For unknown tokens, show shortened address
  return `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`;
}

/**
 * Get token icon URL
 */
export function getTokenIcon(tokenAddress: string): string | null {
  if (normalizeTokenAddress(tokenAddress) === USDC_CONTRACT_ADDRESS) {
    return "https://static.cartridge.gg/tokens/usdc.svg";
  }
  return null;
}
