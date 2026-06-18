// Types
export type {
  StarterpackDetails,
  BackendStarterpackDetails,
  OnchainStarterpackDetails,
  Item,
  Quote,
  TokenMetadata,
  MerkleDrop,
  StarterpackType,
  PaymentMethod,
} from "./types";
export {
  isClaimStarterpack,
  isOnchainStarterpack,
  detectStarterpackType,
  ItemType,
} from "./types";

// Starterpack context (shared base)
export { StarterpackProvider } from "./starterpack";
export { useStarterpackContext } from "./use-starterpack-context";
export type { StarterpackContextType } from "./starterpack-context";

// Onchain purchase context
export { OnchainPurchaseProvider } from "./onchain-purchase";
export { useOnchainPurchaseContext } from "./use-onchain-purchase-context";
export type {
  OnchainPurchaseContextType,
  TokenOption,
} from "./onchain-purchase-context";

// Credit purchase context
export { CreditPurchaseProvider } from "./credit-purchase";
export { useCreditPurchaseContext } from "./use-credit-purchase-context";
export type { CreditPurchaseContextType } from "./credit-purchase-context";

// Composed provider for all starterpack contexts
import { ReactNode } from "react";
import { StarterpackProvider } from "./starterpack";
import { OnchainPurchaseProvider } from "./onchain-purchase";
import { CreditPurchaseProvider } from "./credit-purchase";

export function StarterpackProviders({ children }: { children: ReactNode }) {
  return (
    <StarterpackProvider>
      <OnchainPurchaseProvider>
        <CreditPurchaseProvider>{children}</CreditPurchaseProvider>
      </OnchainPurchaseProvider>
    </StarterpackProvider>
  );
}
