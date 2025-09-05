import { Call } from "starknet";

export enum StarterPackItemType {
  NONFUNGIBLE,
  FUNGIBLE,
}

export interface StarterPackItem {
  type: StarterPackItemType;
  name: string;
  description: string;
  iconURL?: string;
  amount?: number;
  price?: bigint;
  call?: Call[];
}

export interface StarterPack {
  name: string;
  description: string;
  iconURL?: string;
  items: StarterPackItem[];
}

export function calculateStarterPackPrice(starterPack: StarterPack): bigint {
  if (!starterPack.items) return 0n;

  return starterPack.items.reduce((total, item) => {
    const itemTotal = BigInt(item.price || 0) * BigInt(item.amount || 1);
    return total + itemTotal;
  }, 0n);
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
