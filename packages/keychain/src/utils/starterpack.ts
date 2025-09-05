import { Call } from "starknet";

export interface StarterPackItem {
  type: "NONFUNGIBLE" | "FUNGIBLE";
  name: string;
  description: string;
  iconURL?: string;
  amount?: number;
  price?: number;
  call: Call[];
}

export interface StarterPack {
  name: string;
  description: string;
  iconURL?: string;
  items?: StarterPackItem[];
}

export function calculateStarterPackPrice(starterPack: StarterPack): number {
  if (!starterPack.items) return 0;

  return starterPack.items.reduce((total, item) => {
    const itemTotal = (item.price || 0) * (item.amount || 1);
    return total + itemTotal;
  }, 0);
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

export function generateNonce(): string {
  return Math.floor(Math.random() * 1000000).toString();
}

export function getDefaultExpiry(): number {
  // Default to 1 hour from now
  return Math.floor(Date.now() / 1000) + 3600;
}
