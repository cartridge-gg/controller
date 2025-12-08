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
export { StarterpackProvider, useStarterpackContext } from "./starterpack";
export type { StarterpackContextType } from "./starterpack";

// Onchain purchase context
export {
  OnchainPurchaseProvider,
  useOnchainPurchaseContext,
} from "./onchain-purchase";
export type {
  OnchainPurchaseContextType,
  TokenOption,
} from "./onchain-purchase";

// Credit purchase context
export {
  CreditPurchaseProvider,
  useCreditPurchaseContext,
} from "./credit-purchase";
export type { CreditPurchaseContextType, CostDetails } from "./credit-purchase";

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
