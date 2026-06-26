import { createContext, useContext, type ReactNode } from "react";
import type { CoinflowIntent } from "@/hooks/payments/coinflow";

/**
 * Product-agnostic contract the Coinflow (card) checkout UI depends on.
 *
 * `CoinflowForm` / `CoinflowCheckout` consume only this interface. Every
 * Coinflow intent — bundle, credits, future assets — has the same shape and is
 * completed by the same `coinflowCardCheckout` mutation; the only product
 * difference is which mutation creates the intent and where to go on success.
 * Each product supplies a provider:
 *  - `intent` is the already-created Coinflow intent the form tokenizes against.
 *  - `onSuccess` lets the product decide the post-payment destination (route
 *    navigation for the bundle flow, close-and-refresh for the credits drawer).
 */
export interface CoinflowRailContextValue {
  intent: CoinflowIntent | undefined;
  env: "prod" | "sandbox";
  onSuccess: () => void;
}

const CoinflowRailContext = createContext<CoinflowRailContextValue | undefined>(
  undefined,
);

export function CoinflowRailProvider({
  value,
  children,
}: {
  value: CoinflowRailContextValue;
  children: ReactNode;
}) {
  return (
    <CoinflowRailContext.Provider value={value}>
      {children}
    </CoinflowRailContext.Provider>
  );
}

export function useCoinflowRail(): CoinflowRailContextValue {
  const ctx = useContext(CoinflowRailContext);
  if (!ctx) {
    throw new Error(
      "useCoinflowRail must be used within a CoinflowRailProvider",
    );
  }
  return ctx;
}
