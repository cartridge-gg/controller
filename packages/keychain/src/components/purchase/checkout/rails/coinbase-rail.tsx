import { createContext, useContext, type ReactNode } from "react";
import type {
  CoinbaseLimitsResult,
  CoinbaseOrderResult,
  CoinbaseQuoteResult,
  UseCoinbaseReturn,
} from "@/hooks/payments/coinbase";
import type {
  CoinbaseOnrampStatus,
  SubmitCoinbaseLimitsUpgradeInput,
} from "@/utils/api";

/**
 * Product-agnostic contract the Coinbase (Apple Pay) checkout UI depends on.
 *
 * The rail UI (`CoinbaseCheckout`, `CoinbasePopupStatus`) consumes only this
 * interface — it has no knowledge of bundles, credits, or any other product.
 * Each product supplies a provider that maps its own purchase state onto this
 * shape:
 *  - `createOrder` has the USDC amount (and any `credits` flag) pre-bound by the
 *    product, so the rail can call it with no purchase context.
 *  - `onComplete` lets the product decide what "payment done" means — route
 *    navigation for the bundle flow, close-and-refresh for the credits drawer.
 *    The name is shared by every rail (Coinbase, Coinflow, controller) so the
 *    host has one uniform completion seam.
 *
 * The verifications (Coinbase KYC/limits, age gate) live here because they are
 * required by the rail, not the product.
 */
export interface CoinbaseRailContextValue {
  // Order + popup state (passthrough from useCoinbase)
  orderId: string | undefined;
  paymentLink: string | undefined;
  isCreatingOrder: boolean;
  orderStatus: CoinbaseOnrampStatus | undefined;
  popupClosed: boolean;
  paymentSuccess: boolean;
  /** Onramp quote — the rail uses `paymentTotal` to evaluate Coinbase limits. */
  quote: CoinbaseQuoteResult | undefined;

  // Limits / KYC upgrade (rail-required verification)
  limits: CoinbaseLimitsResult | undefined;
  isFetchingLimits: boolean;
  isSubmittingLimitsUpgrade: boolean;
  fetchLimits: () => Promise<CoinbaseLimitsResult | undefined>;
  submitLimitsUpgrade: (
    input: SubmitCoinbaseLimitsUpgradeInput,
  ) => Promise<CoinbaseLimitsResult | undefined>;

  // Actions (amount + product flags pre-bound by the product)
  createOrder: (opts?: {
    force?: boolean;
  }) => Promise<CoinbaseOrderResult | undefined>;
  openPaymentPopup: UseCoinbaseReturn["openPaymentPopup"];
  /** Kill any in-flight payment popup (e.g. when a hosting drawer is dismissed). */
  closePaymentPopup: () => void;

  /** Where to go once the onramp payment is confirmed. */
  onComplete: () => void;
}

const CoinbaseRailContext = createContext<CoinbaseRailContextValue | undefined>(
  undefined,
);

export function CoinbaseRailProvider({
  value,
  children,
}: {
  value: CoinbaseRailContextValue;
  children: ReactNode;
}) {
  return (
    <CoinbaseRailContext.Provider value={value}>
      {children}
    </CoinbaseRailContext.Provider>
  );
}

export function useCoinbaseRail(): CoinbaseRailContextValue {
  const ctx = useContext(CoinbaseRailContext);
  if (!ctx) {
    throw new Error(
      "useCoinbaseRail must be used within a CoinbaseRailProvider",
    );
  }
  return ctx;
}
