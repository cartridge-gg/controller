import { addAddressPadding, hash, num } from "starknet";

/**
 * Normalize a felt value to a lowercase hex string.
 */
export function normalizeFelt(value: string | number | bigint): string {
  return num.toHex(value).toLowerCase();
}

/**
 * Derive a Starknet selector from an entrypoint name or hex selector.
 */
export function selectorFromEntrypoint(entrypoint: string): string {
  if (/^0x[0-9a-f]+$/i.test(entrypoint)) {
    return normalizeFelt(entrypoint);
  }
  return normalizeFelt(hash.getSelectorFromName(entrypoint));
}

/**
 * Normalize and pad a Starknet contract address.
 */
export function normalizeContractAddress(
  address: string,
  context: string,
): string {
  const trimmed = address.trim();
  if (!trimmed) {
    throw new Error(`${context} is missing a contract address.`);
  }
  return addAddressPadding(trimmed.toLowerCase());
}
