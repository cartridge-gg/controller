/**
 * Converts USDC amount (with 6 decimals) to USD display value
 * @param usdcAmount - USDC amount in smallest units (microdollars)
 * @returns USD amount as number
 */
export function usdcToUsd(usdcAmount: bigint): number {
  // USDC has 6 decimal places, so divide by 10^6
  return Number(usdcAmount) / 1_000_000;
}
