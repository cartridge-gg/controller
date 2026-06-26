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
  const onchain = useOnchainPurchaseContext();
  const { coinflowIntent, coinflowEnv } = useCreditPurchaseContext();

  const coinbaseValue = useMemo<CoinbaseRailContextValue>(
    () => ({
      orderId: onchain.orderId,
      paymentLink: onchain.paymentLink,
      isCreatingOrder: onchain.isCreatingOrder,
      orderStatus: onchain.orderStatus,
      popupClosed: onchain.popupClosed,
      paymentSuccess: onchain.paymentSuccess,
      quote: onchain.coinbaseQuote,
      limits: onchain.coinbaseLimits,
      isFetchingLimits: onchain.isFetchingCoinbaseLimits,
      isSubmittingLimitsUpgrade: onchain.isSubmittingLimitsUpgrade,
      fetchLimits: onchain.fetchCoinbaseLimits,
      submitLimitsUpgrade: onchain.submitCoinbaseLimitsUpgrade,
      createOrder: onchain.onCreateCoinbaseOrder,
      openPaymentPopup: onchain.openPaymentPopup,
      closePaymentPopup: onchain.closePaymentPopup,
      onConfirmed: () => navigate("/purchase/pending", { reset: true }),
    }),
    [onchain, navigate],
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
