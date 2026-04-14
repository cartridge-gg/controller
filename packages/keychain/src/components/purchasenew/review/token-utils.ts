import { USDC_CONTRACT_ADDRESS } from "@cartridge/controller-ui/utils";
import { USDC_ADDRESSES, USDCE_ADDRESSES } from "@/utils/ekubo";

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

export function isUsdcToken(tokenAddress: string): boolean {
  const normalized = normalizeTokenAddress(tokenAddress);
  if (normalized === USDC_CONTRACT_ADDRESS) return true;
  if (
    Object.values(USDC_ADDRESSES).some(
      (addr) => normalizeTokenAddress(addr) === normalized,
    )
  )
    return true;
  return Object.values(USDCE_ADDRESSES).some(
    (addr) => normalizeTokenAddress(addr) === normalized,
  );
}

/**
 * Get the number of decimals for a token address
 * USDC = 6 decimals, everything else = 18 decimals
 */
export function getTokenDecimals(tokenAddress: string): number {
  return isUsdcToken(tokenAddress) ? 6 : 18;
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
  const normalized = normalizeTokenAddress(tokenAddress);
  if (normalized === USDC_CONTRACT_ADDRESS) return "USDC.e";
  if (
    Object.values(USDC_ADDRESSES).some(
      (addr) => normalizeTokenAddress(addr) === normalized,
    )
  )
    return "USDC";
  if (
    Object.values(USDCE_ADDRESSES).some(
      (addr) => normalizeTokenAddress(addr) === normalized,
    )
  )
    return "USDC.e";

  // For unknown tokens, show shortened address
  return `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`;
}

/**
 * Get token icon URL
 */
export function getTokenIcon(tokenAddress: string): string | null {
  if (isUsdcToken(tokenAddress)) {
    return "https://static.cartridge.gg/tokens/usdc.svg";
  }
  return null;
}
