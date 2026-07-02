import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Drawer, DrawerContent, DepositIcon } from "@cartridge/controller-ui";
import { useConnection } from "@/hooks/connection";
import {
  CoinbaseRailProvider,
  type CoinbaseRailContextValue,
} from "@/components/purchase/checkout/rails";
import { CoinbaseDrawer } from "@/components/purchase/checkout/coinbase/drawer";
import {
  useCoinbase,
  COINBASE_APPLE_PAY_MIN_USD,
} from "@/hooks/payments/coinbase";
import { waitForCryptoPaymentConfirmation } from "@/hooks/payments/crypto";
import { useUsdcToken } from "@/hooks/payments/usdc";
import { CoinbaseOnrampStatus } from "@/utils/api";
import type { PaymentMethodSelection } from "@/components/purchase/checkout/onchain/wallet-drawer";
import { CheckoutReviewContent } from "./CheckoutReviewContent";
import { useFiatCheckoutFlow } from "./useFiatCheckoutFlow";

interface CoinbaseCreditsCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  /** Payment-accepted seam supplied by the host: shows the deposit status view
   * and awaits the given settlement wait before declaring success. */
  onPaymentComplete: (settle: () => Promise<void>) => void;
  amount: number;
  paymentMethod: PaymentMethodSelection | null;
  onChangeMethod: () => void;
  onChangeAmount: () => void;
}

/** How long to wait for the Base→Starknet bridge to complete and the Layerswap
 * webhook to grant the credits. Matches the bundle flow's layerswap deposit
 * window (bridging normally takes a few minutes). */
const COINBASE_SETTLEMENT_TIMEOUT_MS = 10 * 60 * 1000;

/**
 * Credits checkout for the Coinbase (Apple Pay) rail: review → verify
 * (email + phone) → pay. Owns a single `useCoinbase()` instance that spans both
 * phases, so the quote fetched for the review's total (and any quote error)
 * carries into the CoinbaseDrawer. Binds the order to a credits top-up
 * (`purchaseUSDCAmount` + `credits: true`); the backend grants credits from the
 * Layerswap webhook once the onramp settles.
 */
export function CoinbaseCreditsCheckout({
  isOpen,
  onClose,
  onPaymentComplete,
  amount,
  paymentMethod,
  onChangeMethod,
  onChangeAmount,
}: CoinbaseCreditsCheckoutProps) {
  const { isMainnet } = useConnection();
  const usdcToken = useUsdcToken();
  const [orderError, setOrderError] = useState<Error | null>(null);

  const coinbase = useCoinbase({ onError: setOrderError });
  const {
    orderId,
    paymentLink,
    isCreatingOrder,
    orderStatus,
    popupClosed,
    paymentSuccess,
    coinbaseQuote,
    isFetchingQuote,
    limits,
    isFetchingLimits,
    isSubmittingLimitsUpgrade,
    fetchLimits,
    submitLimitsUpgrade,
    createOrder: createCoinbaseOrder,
    getQuote,
    openPaymentPopup,
    closePaymentPopup,
  } = coinbase;

  const { phase, verifying, handleContinue, backToReview } =
    useFiatCheckoutFlow({ method: "apple-pay" });

  // Decimal USDC string ("2.000000"), NOT base units — the onramp API reads
  // this as dollars (see the same conversion in starterpack/onchain-purchase).
  const purchaseUSDCAmount = useMemo(() => amount.toFixed(6), [amount]);

  // Fetch a quote on open so the review can show the total (incl. fees) and the
  // Coinbase limit check (KYC) can evaluate the payment total.
  useEffect(() => {
    if (!isOpen || amount < COINBASE_APPLE_PAY_MIN_USD) return;
    setOrderError(null);
    getQuote({ purchaseUSDCAmount, sandbox: !isMainnet }).catch(() => {
      // Surfaced via onError -> orderError in the review.
    });
  }, [isOpen, amount, purchaseUSDCAmount, isMainnet, getQuote]);

  // The order guard reads live order state, but `createOrder` must keep a STABLE
  // identity: CoinbaseCheckout eager-creates the order in an effect keyed on it,
  // so if its identity changed each attempt (isCreatingOrder/orderStatus flipping)
  // a failing order would re-trigger the effect forever. Read the guard inputs
  // from a ref instead of closing over them.
  const guardRef = useRef({
    isCreatingOrder,
    paymentLink,
    paymentSuccess,
    popupClosed,
    orderStatus,
    purchaseUSDCAmount,
  });
  guardRef.current = {
    isCreatingOrder,
    paymentLink,
    paymentSuccess,
    popupClosed,
    orderStatus,
    purchaseUSDCAmount,
  };

  // The CryptoPayments row linked to the order — the Layerswap "completed"
  // webhook grants the credits in the same transaction that confirms it, so
  // its status is the "credits landed" signal to poll after Apple Pay.
  const cryptoPaymentIdRef = useRef<string | undefined>(undefined);

  const createOrder = useCallback(
    async (opts?: { force?: boolean }) => {
      const g = guardRef.current;
      const force = opts?.force ?? false;
      const hasStaleOrder =
        g.paymentSuccess ||
        g.popupClosed ||
        g.orderStatus === CoinbaseOnrampStatus.Completed ||
        g.orderStatus === CoinbaseOnrampStatus.Failed;

      if (g.isCreatingOrder || (g.paymentLink && !force && !hasStaleOrder)) {
        return;
      }

      const order = await createCoinbaseOrder({
        purchaseUSDCAmount: g.purchaseUSDCAmount,
        credits: true,
      });
      cryptoPaymentIdRef.current =
        order?.layerswapPayment?.cryptoPaymentId ?? undefined;
      return order;
    },
    [createCoinbaseOrder],
  );

  const value = useMemo<CoinbaseRailContextValue>(
    () => ({
      orderId,
      paymentLink,
      isCreatingOrder,
      orderStatus,
      popupClosed,
      paymentSuccess,
      quote: coinbaseQuote,
      limits,
      isFetchingLimits,
      isSubmittingLimitsUpgrade,
      fetchLimits,
      submitLimitsUpgrade,
      createOrder,
      openPaymentPopup,
      closePaymentPopup,
      // Apple Pay finishing is not the end of the flow: the USDC still has to
      // bridge to Starknet and the Layerswap webhook grant the credits (plan
      // §D: keep polling past the payment step). Hand the host a settlement
      // wait on the linked crypto payment; if the order somehow carried no
      // linked payment, complete optimistically (pre-polling behavior).
      onComplete: () =>
        onPaymentComplete(async () => {
          const cryptoPaymentId = cryptoPaymentIdRef.current;
          if (!cryptoPaymentId) return;
          await waitForCryptoPaymentConfirmation(
            cryptoPaymentId,
            COINBASE_SETTLEMENT_TIMEOUT_MS,
          );
        }),
    }),
    [
      orderId,
      paymentLink,
      isCreatingOrder,
      orderStatus,
      popupClosed,
      paymentSuccess,
      coinbaseQuote,
      limits,
      isFetchingLimits,
      isSubmittingLimitsUpgrade,
      fetchLimits,
      submitLimitsUpgrade,
      createOrder,
      openPaymentPopup,
      closePaymentPopup,
      onPaymentComplete,
    ],
  );

  return (
    <CoinbaseRailProvider value={value}>
      {/* One drawer at a time: while verifying, the identity drawers (from
          IdentityProvider) are showing, so we mount neither the review nor the
          payment drawer. Closing the payment drawer returns to the review
          rather than aborting the whole deposit. */}
      {verifying ? null : phase === "review" ? (
        <Drawer isOpen={isOpen} onClose={onClose} className="gap-4">
          <DrawerContent
            title="Deposit USD"
            icon={<DepositIcon variant="solid" />}
          >
            <CheckoutReviewContent
              paymentMethod={paymentMethod}
              amount={amount}
              onChangeMethod={onChangeMethod}
              onChangeAmount={onChangeAmount}
              costToken={usdcToken}
              costValue={
                coinbaseQuote ? (
                  <span className="text-foreground-100">
                    {`$${Number(coinbaseQuote.paymentTotal.amount).toFixed(2)}`}
                  </span>
                ) : (
                  <span className="text-foreground-400">—</span>
                )
              }
              isCostLoading={isFetchingQuote && !coinbaseQuote}
              error={orderError?.message}
              buttonLabel="CONTINUE"
              onContinue={handleContinue}
              // No usable quote (e.g. the onramp quote failed) — block CONTINUE
              // so we don't advance into a payment flow that can't price/limit.
              buttonDisabled={!!orderError || !coinbaseQuote}
            />
          </DrawerContent>
        </Drawer>
      ) : (
        <CoinbaseDrawer isOpen={isOpen} onClose={backToReview} />
      )}
    </CoinbaseRailProvider>
  );
}
