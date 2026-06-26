import { useEffect, useMemo, useState } from "react";
import { Drawer, DrawerContent, DepositIcon } from "@cartridge/controller-ui";
import { usdToCredits } from "@/utils/credits";
import {
  CoinflowRailProvider,
  type CoinflowRailContextValue,
} from "@/components/purchase/checkout/rails";
import { CoinflowDrawer } from "@/components/purchase/checkout/coinflow/drawer";
import {
  CREDITS_TOKEN,
  convertCentsToDollars,
} from "@/components/purchase/review/cost";
import {
  useCoinflowCreditsPayment,
  type CoinflowIntent,
} from "@/hooks/payments/coinflow";
import type { PaymentMethodSelection } from "@/components/purchase/checkout/onchain/wallet-drawer";
import { CheckoutReviewContent } from "./CheckoutReviewContent";
import { useFiatCheckoutFlow } from "./useFiatCheckoutFlow";

interface CoinflowCreditsCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  /** Completion seam supplied by the host (refresh balance + close). */
  onComplete: () => void;
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
  onComplete,
  amount,
  paymentMethod,
  onChangeMethod,
  onChangeAmount,
}: CoinflowCreditsCheckoutProps) {
  const { createIntent, env, isLoading, error } = useCoinflowCreditsPayment();
  const [intent, setIntent] = useState<CoinflowIntent>();
  const { phase, verifying, handleContinue, backToReview } =
    useFiatCheckoutFlow({ method: "coinflow" });

  // Create the intent when the drawer opens so the review can quote a total and
  // the pay phase can reuse it. Drop it on close so a re-open mints a fresh one.
  useEffect(() => {
    if (!isOpen || amount <= 0 || intent) return;
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
  }, [isOpen, amount, intent, createIntent]);

  useEffect(() => {
    if (!isOpen) setIntent(undefined);
  }, [isOpen]);

  const value = useMemo<CoinflowRailContextValue>(
    () => ({ intent, env, onComplete }),
    [intent, env, onComplete],
  );

  return (
    <CoinflowRailProvider value={value}>
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
              costToken={CREDITS_TOKEN}
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
              error={error?.message}
              buttonLabel="CONTINUE"
              onContinue={handleContinue}
              // No usable intent (e.g. intent creation failed) — block CONTINUE
              // so we don't advance into a card form that can't tokenize/charge.
              buttonDisabled={!!error || !intent}
            />
          </DrawerContent>
        </Drawer>
      ) : (
        <CoinflowDrawer isOpen={isOpen} onClose={backToReview} />
      )}
    </CoinflowRailProvider>
  );
}
