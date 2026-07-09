import { useCallback, useEffect, useRef } from "react";
import {
  Button,
  Drawer,
  DrawerContent,
  DepositIcon,
} from "@cartridge/controller-ui";
import { useTokens } from "@/hooks/token";
import { ConfirmingTransaction } from "@/components/purchase/pending/confirming-transaction";
import { ErrorCard } from "@/components/purchase/checkout/onchain/error";
import type { PaymentMethodSelection } from "@/components/purchase/checkout/onchain/wallet-drawer";
import { ControllerRailProvider } from "@/components/purchase/checkout/rails";
import { ControllerCheckout } from "@/components/purchase/checkout/controller";
import { useCreditsContext } from "./provider";
import { CoinflowCreditsCheckout } from "./CoinflowCreditsCheckout";
import { CoinbaseCreditsCheckout } from "./CoinbaseCreditsCheckout";

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: PaymentMethodSelection | null;
  amount: number;
  onChangeMethod: () => void;
  onChangeAmount: () => void;
}

/** Container for the checkout step. Every method starts from the same checkout
 * details review:
 *  - controller: ControllerCheckout shows the review and runs the deposit
 *    (settlement is synchronous — execute resolves once the sweeper confirms).
 *  - fiat (Apple Pay / card): the rail checkout shows the review, then on
 *    continue runs the rail-required verification (if needed) and the payment
 *    drawer. The payment step only means "payment accepted" — credits are
 *    granted later by a webhook (Coinflow settlement / Layerswap completion) —
 *    so completion goes through `onPaymentComplete`, which shows the deposit
 *    status view and polls the rail's settlement before declaring success.
 * Both seams end the same way: refresh balance → fire the success callback
 * registered by initiateCreditsDeposit (e.g. the bundle-with-credits flow
 * resumes by refetching its balance). */
export function Checkout({
  isOpen,
  onClose,
  paymentMethod,
  amount,
  onChangeMethod,
  onChangeAmount,
}: CheckoutProps) {
  const { credits } = useTokens();
  const { onDepositStarted, onDepositFinished, depositInProgress } =
    useCreditsContext();

  // Controller rail: execute() resolves only after the backend confirms the
  // deposit and grants the credits, so completing is immediately final.
  const onComplete = useCallback(async () => {
    await credits.refetch?.();
    await onDepositFinished();
    onClose();
  }, [credits, onDepositFinished, onClose]);

  // Fiat rails re-render their completion trigger (e.g. the Coinbase status
  // effect) until the status view replaces them — run the settlement once.
  const settlingRef = useRef(false);
  useEffect(() => {
    if (!isOpen) settlingRef.current = false;
  }, [isOpen]);

  const onPaymentComplete = useCallback(
    async (settle: () => Promise<void>) => {
      if (settlingRef.current || !paymentMethod) return;
      settlingRef.current = true;
      onDepositStarted(paymentMethod, amount);
      try {
        await settle();
        await credits.refetch?.();
        await onDepositFinished();
      } catch (e) {
        // Refetch regardless — on a poll timeout the credits may still land.
        await credits.refetch?.();
        await onDepositFinished(e instanceof Error ? e.message : String(e));
      }
    },
    [paymentMethod, amount, onDepositStarted, onDepositFinished, credits],
  );

  // Deposit status view (payment accepted → settling → success/error). Closing
  // while processing is allowed — the settlement keeps running here (this
  // component stays mounted under CreditsProvider) and the balance refresh +
  // success callback still fire when it lands.
  if (depositInProgress) {
    const { status } = depositInProgress;
    return (
      <Drawer isOpen={isOpen} onClose={onClose} className="gap-4">
        <DrawerContent
          title="Deposit USD"
          icon={<DepositIcon variant="solid" />}
        >
          <div className="flex flex-col gap-4">
            {status === "error" ? (
              <ErrorCard
                variant="error"
                title="Deposit not confirmed"
                message={depositInProgress.error ?? "The deposit failed."}
              />
            ) : (
              <ConfirmingTransaction
                title={
                  status === "success"
                    ? "Deposit complete"
                    : "Processing deposit..."
                }
                status={status === "success" ? "success" : "loading"}
              />
            )}
            {status === "processing" && (
              <p className="text-xs text-foreground-300">
                This can take a few minutes. You can close this window — your
                balance will update automatically.
              </p>
            )}
            <Button onClick={onClose}>
              {status === "success" ? "DONE" : "CLOSE"}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  const methodType = paymentMethod?.type;

  if (methodType === "coinflow") {
    return (
      <CoinflowCreditsCheckout
        isOpen={isOpen}
        onClose={onClose}
        onPaymentComplete={onPaymentComplete}
        amount={amount}
        paymentMethod={paymentMethod}
        onChangeMethod={onChangeMethod}
        onChangeAmount={onChangeAmount}
      />
    );
  }

  if (methodType === "apple-pay") {
    return (
      <CoinbaseCreditsCheckout
        isOpen={isOpen}
        onClose={onClose}
        onPaymentComplete={onPaymentComplete}
        amount={amount}
        paymentMethod={paymentMethod}
        onChangeMethod={onChangeMethod}
        onChangeAmount={onChangeAmount}
      />
    );
  }

  // Controller (USDC deposit) — review + deposit live in ControllerCheckout.
  return (
    <Drawer isOpen={isOpen} onClose={onClose} className="gap-4">
      <DrawerContent title="Deposit USD" icon={<DepositIcon variant="solid" />}>
        <ControllerRailProvider amount={amount} onComplete={onComplete}>
          <ControllerCheckout
            paymentMethod={paymentMethod}
            onChangeMethod={onChangeMethod}
            onChangeAmount={onChangeAmount}
          />
        </ControllerRailProvider>
      </DrawerContent>
    </Drawer>
  );
}
