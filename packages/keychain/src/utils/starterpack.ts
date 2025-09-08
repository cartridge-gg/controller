import {
  StarterPack,
  StarterPackItem,
  StarterPackItemType,
} from "@cartridge/controller";
import { Call } from "starknet";

/**
 * Runtime guard for StarterPackItem
 */
export function isStarterPackItem(value: unknown): value is StarterPackItem {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StarterPackItem> & Record<string, unknown>;
  const hasValidType =
    typeof candidate.type === "string" &&
    (candidate.type === StarterPackItemType.NONFUNGIBLE ||
      candidate.type === StarterPackItemType.FUNGIBLE);
  const hasValidName = typeof candidate.name === "string";
  const hasValidDescription = typeof candidate.description === "string";
  const hasValidIconUrl =
    candidate.iconURL === undefined || typeof candidate.iconURL === "string";
  const hasValidAmount =
    candidate.amount === undefined || typeof candidate.amount === "number";
  const hasValidPrice =
    candidate.price === undefined ||
    typeof candidate.price === "bigint" ||
    typeof (candidate as Record<string, unknown>).price === "number" ||
    typeof (candidate as Record<string, unknown>).price === "string";
  const hasValidCall =
    candidate.call === undefined || Array.isArray(candidate.call);

  return (
    hasValidType &&
    hasValidName &&
    hasValidDescription &&
    hasValidIconUrl &&
    hasValidAmount &&
    hasValidPrice &&
    hasValidCall
  );
}

/**
 * Runtime guard for StarterPack
 */
export function isStarterPack(value: unknown): value is StarterPack {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StarterPack> & Record<string, unknown>;
  const hasValidName = typeof candidate.name === "string";
  const hasValidDescription = typeof candidate.description === "string";
  const hasValidIconUrl =
    candidate.iconURL === undefined || typeof candidate.iconURL === "string";
  const hasValidItems =
    Array.isArray(candidate.items) &&
    candidate.items.every((it) => isStarterPackItem(it));

  return (
    hasValidName && hasValidDescription && hasValidIconUrl && hasValidItems
  );
}

/**
 * Normalize a price-like value to bigint, accepting bigint | number | string | undefined
 */
export function normalizePriceToBigInt(value: unknown): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(Math.trunc(value));
  if (typeof value === "string" && value.trim() !== "") return BigInt(value);
  return 0n;
}

export function calculateStarterPackPrice(starterPack: StarterPack): bigint {
  if (!starterPack.items) return 0n;

  return starterPack.items.reduce((total, item) => {
    const price = normalizePriceToBigInt(
      (item as unknown as Record<string, unknown>).price ?? item.price,
    );
    const amount = BigInt(item.amount || 1);
    const itemTotal = price * amount;
    return total + itemTotal;
  }, 0n);
}

/**
 * Converts USDC amount (with 6 decimals) to USD display value
 * @param usdcAmount - USDC amount in smallest units (microdollars)
 * @returns USD amount as number
 */
export function usdcToUsd(usdcAmount: bigint): number {
  // USDC has 6 decimal places, so divide by 10^6
  return Number(usdcAmount) / 1_000_000;
}

export function aggregateStarterPackCalls(starterPack: StarterPack): Call[] {
  if (!starterPack.items) return [];

  const allCalls: Call[] = [];

  for (const item of starterPack.items) {
    if (item.call && item.call.length > 0) {
      // Add all calls for this item
      // Note: For items with amount > 1, the call logic should handle quantity
      // or the call should be repeated based on contract design
      allCalls.push(...item.call);
    }
  }

  return allCalls;
}
