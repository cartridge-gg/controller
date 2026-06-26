import { useMemo, type ReactNode } from "react";
import { useNavigation } from "../navigation";
import {
  CoinbaseRailProvider,
  CoinflowRailProvider,
  type CoinbaseRailContextValue,
  type CoinflowRailContextValue,
} from "@/components/purchase/checkout/rails";
import { useOnchainPurchaseContext } from "./onchain-purchase";
import { useCreditPurchaseContext } from "./credit-purchase";

/**
 * Adapts the bundle/starterpack purchase contexts onto the neutral rail
 * contracts the Coinbase + Coinflow checkout UI depend on. This is the only
 * place that knows a *bundle* is being bought — the rail UI stays
 * product-agnostic. Credits (and future assets) supply their own rail values.
 */
export function BundleRailProviders({ children }: { children: ReactNode }) {
  const { navigate } = useNavigation();
  // Destructure the specific fields rather than depending on the whole context
  // object: the onchain context value is a plain (unmemoized) literal recreated
  // every render, so a `[onchain]` dep would rebuild the rail value — and
  // re-render every rail consumer — on every render. The pulled fields are all
  // stable (state values + useCallback'd actions), so individual deps rebuild
  // the rail value only when something actually changes.
  const {
    orderId,
    paymentLink,
    isCreatingOrder,
    orderStatus,
    popupClosed,
    paymentSuccess,
    coinbaseQuote,
    coinbaseLimits,
    isFetchingCoinbaseLimits,
    isSubmittingLimitsUpgrade,
    fetchCoinbaseLimits,
    submitCoinbaseLimitsUpgrade,
    onCreateCoinbaseOrder,
    openPaymentPopup,
    closePaymentPopup,
  } = useOnchainPurchaseContext();
  const { coinflowIntent, coinflowEnv } = useCreditPurchaseContext();

  const coinbaseValue = useMemo<CoinbaseRailContextValue>(
    () => ({
      orderId,
      paymentLink,
      isCreatingOrder,
      orderStatus,
      popupClosed,
      paymentSuccess,
      quote: coinbaseQuote,
      limits: coinbaseLimits,
      isFetchingLimits: isFetchingCoinbaseLimits,
      isSubmittingLimitsUpgrade,
      fetchLimits: fetchCoinbaseLimits,
      submitLimitsUpgrade: submitCoinbaseLimitsUpgrade,
      createOrder: onCreateCoinbaseOrder,
      openPaymentPopup,
      closePaymentPopup,
      onConfirmed: () => navigate("/purchase/pending", { reset: true }),
    }),
    [
      orderId,
      paymentLink,
      isCreatingOrder,
      orderStatus,
      popupClosed,
      paymentSuccess,
      coinbaseQuote,
      coinbaseLimits,
      isFetchingCoinbaseLimits,
      isSubmittingLimitsUpgrade,
      fetchCoinbaseLimits,
      submitCoinbaseLimitsUpgrade,
      onCreateCoinbaseOrder,
      openPaymentPopup,
      closePaymentPopup,
      navigate,
    ],
  );

  const coinflowValue = useMemo<CoinflowRailContextValue>(
    () => ({
      intent: coinflowIntent,
      env: coinflowEnv,
      onSuccess: () => navigate("/purchase/success", { reset: true }),
    }),
    [coinflowIntent, coinflowEnv, navigate],
  );

  return (
    <CoinbaseRailProvider value={coinbaseValue}>
      <CoinflowRailProvider value={coinflowValue}>
        {children}
      </CoinflowRailProvider>
    </CoinbaseRailProvider>
  );
}
