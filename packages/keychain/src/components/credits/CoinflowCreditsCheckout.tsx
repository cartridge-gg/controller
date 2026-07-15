import { useEffect, useMemo, useState } from "react";
import { Drawer, DrawerContent } from "@cartridge/controller-ui";
import { usdToCredits, MIN_CREDITS_PURCHASE_USD } from "@/utils/credits";
import { ErrorCard } from "@/components/purchase/checkout/onchain/error";
import {
  CoinflowRailProvider,
  type CoinflowRailContextValue,
} from "@/components/purchase/checkout/rails";
import { CoinflowDrawer } from "@/components/purchase/checkout/coinflow/drawer";
import { convertCentsToDollars } from "@/components/purchase/review/cost";
import { useUsdcToken } from "@/hooks/payments/usdc";
import {
  useCoinflowCreditsPayment,
  useCoinflowIsMainnet,
  waitForCoinflowSettlement,
  type CoinflowIntent,
} from "@/hooks/payments/coinflow";
import type { PaymentMethodSelection } from "@/components/purchase/checkout/onchain/wallet-drawer";
import { CheckoutReviewContent } from "./CheckoutReviewContent";
import { useFiatCheckoutFlow } from "./useFiatCheckoutFlow";

interface CoinflowCreditsCheckoutProps {
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

/**
 * Credits checkout for the Coinflow (card) rail: review → verify (email) → pay.
 * The intent is created up front so the review can show the real total (incl.
 * fees) and surface any quote error; the same intent is reused by the
 * CoinflowDrawer in the pay phase.
 */
export function CoinflowCreditsCheckout({
  isOpen,
  onClose,
  onPaymentComplete,
  amount,
  paymentMethod,
  onChangeMethod,
  onChangeAmount,
}: CoinflowCreditsCheckoutProps) {
  const { createIntent, env, isLoading, error } = useCoinflowCreditsPayment();
  const usdcToken = useUsdcToken();
  const { isCoinflowSandbox } = useCoinflowIsMainnet();
  const [intent, setIntent] = useState<CoinflowIntent>();
  const { phase, verifying, handleContinue, backToReview } =
    useFiatCheckoutFlow({ method: "coinflow" });

  // The amount drawer enforces this too, but the amount can be carried over
  // from a method with a lower floor (controller allows $1), so the review
  // must re-validate against the backend's $2 buy-credits minimum.
  const amountTooLow = amount < MIN_CREDITS_PURCHASE_USD;

  // Create the intent when the drawer opens so the review can quote a total and
  // the pay phase can reuse it. Drop it on close so a re-open mints a fresh one.
  // Below the minimum the backend would reject the intent — the review shows
  // the amount warning instead.
  useEffect(() => {
    if (!isOpen || amount <= 0 || amountTooLow || intent) return;
    let active = true;
    createIntent({ amount: usdToCredits(amount), decimals: 0 })
      .then((i) => {
        if (active) setIntent(i);
      })
      .catch((e) => {
        // Surfaced via the hook's error state in the review.
        console.error("Failed to create Coinflow credits intent:", e);
      });
    return () => {
      active = false;
    };
  }, [isOpen, amount, amountTooLow, intent, createIntent]);

  useEffect(() => {
    if (!isOpen) setIntent(undefined);
  }, [isOpen]);

  // The card charge succeeding is not the end of the flow: credits are granted
  // by the Coinflow settlement webhook, so completion hands the host a
  // settlement wait on this intent's payment (plan §E: poll paymentStatus past
  // the checkout step).
  const value = useMemo<CoinflowRailContextValue>(
    () => ({
      intent,
      env,
      onComplete: () => {
        if (!intent) return;
        onPaymentComplete(() => waitForCoinflowSettlement(intent.id));
      },
    }),
    [intent, env, onPaymentComplete],
  );

  return (
    <CoinflowRailProvider value={value}>
      {/* One drawer at a time: while verifying, the identity drawers (from
          IdentityProvider) are showing, so we mount neither the review nor the
          payment drawer. Closing the payment drawer returns to the review
          rather than aborting the whole deposit. */}
      {verifying ? null : phase === "review" ? (
        <Drawer isOpen={isOpen} onClose={onClose} className="gap-4">
          <DrawerContent title="Deposit USD">
            <CheckoutReviewContent
              paymentMethod={paymentMethod}
              amount={amount}
              onChangeMethod={onChangeMethod}
              onChangeAmount={onChangeAmount}
              costToken={usdcToken}
              costValue={
                intent ? (
                  <span className="text-foreground-100">
                    {convertCentsToDollars(intent.pricing.totalInCents)}
                  </span>
                ) : (
                  <span className="text-foreground-400">—</span>
                )
              }
              isCostLoading={isLoading && !intent}
              warning={
                amountTooLow || isCoinflowSandbox ? (
                  <>
                    {amountTooLow && (
                      <ErrorCard
                        variant="warning"
                        title="Amount Too Low"
                        message={`The minimum for a card deposit is $${MIN_CREDITS_PURCHASE_USD.toFixed(2)}. Select a higher amount to continue.`}
                      />
                    )}
                    {isCoinflowSandbox && (
                      <ErrorCard
                        variant="warning"
                        title="Coinflow Sandbox Enabled"
                        message="Card checkout will run in Coinflow's sandbox environment. No real charge will be made."
                      />
                    )}
                  </>
                ) : undefined
              }
              error={error?.message}
              buttonLabel="CONTINUE"
              onContinue={handleContinue}
              // No usable intent (amount below the minimum, or intent creation
              // failed) — block CONTINUE so we don't advance into a card form
              // that can't tokenize/charge.
              buttonDisabled={amountTooLow || !!error || !intent}
            />
          </DrawerContent>
        </Drawer>
      ) : (
        <CoinflowDrawer isOpen={isOpen} onClose={backToReview} />
      )}
    </CoinflowRailProvider>
  );
}
