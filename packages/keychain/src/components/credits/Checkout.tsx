import { useCallback } from "react";
import { Drawer, DrawerContent, DepositIcon } from "@cartridge/controller-ui";
import { useTokens } from "@/hooks/token";
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
 *  - controller: ControllerCheckout shows the review and runs the deposit.
 *  - fiat (Apple Pay / card): the rail checkout shows the review, then on
 *    continue runs the rail-required verification (if needed) and the payment
 *    drawer. Each rail owns its own review → verify → pay flow.
 * The shared completion seam (refresh balance → fire the success callback
 * registered by initiateCreditsDeposit → close) is computed here and handed to
 * every rail. */
export function Checkout({
  isOpen,
  onClose,
  paymentMethod,
  amount,
  onChangeMethod,
  onChangeAmount,
}: CheckoutProps) {
  const { credits } = useTokens();
  const { onDepositFinished } = useCreditsContext();

  const onComplete = useCallback(async () => {
    await credits.refetch?.();
    // Fires the success callback registered by initiateCreditsDeposit (e.g. the
    // bundle-with-credits flow resumes by refetching its balance), then closes.
    await onDepositFinished();
    onClose();
  }, [credits, onDepositFinished, onClose]);

  const methodType = paymentMethod?.type;

  if (methodType === "coinflow") {
    return (
      <CoinflowCreditsCheckout
        isOpen={isOpen}
        onClose={onClose}
        onComplete={onComplete}
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
        onComplete={onComplete}
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
