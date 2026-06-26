import { useCallback, useEffect, useState } from "react";
import { Button } from "@cartridge/controller-ui";
import { ConfirmingTransaction } from "@/components/purchase/pending/confirming-transaction";
import { ErrorCard } from "@/components/purchase/checkout/onchain/error";
import { CheckoutReviewContent } from "@/components/credits/CheckoutReviewContent";
import type { PaymentMethodSelection } from "@/components/purchase/checkout/onchain/wallet-drawer";
import { useControllerRail } from "../rails";

type ControllerCheckoutStatus = "idle" | "processing" | "success" | "error";

interface ControllerCheckoutProps {
  /** The selected payment method, surfaced in the wallet selector chrome. */
  paymentMethod: PaymentMethodSelection | null;
  /** Host chrome: jump back to the payment-method picker. */
  onChangeMethod: () => void;
  /** Host chrome: jump back to the amount picker. */
  onChangeAmount: () => void;
}

/**
 * Self-contained controller (USDC deposit) checkout. Owns its own
 * idle|processing|success|error status machine and renders the shared checkout
 * review (the same details body the fiat rails use). All purchase data + the
 * deposit action come from `useControllerRail()`; the host supplies the neutral
 * rail value and the change-method/amount chrome.
 */
export function ControllerCheckout({
  paymentMethod,
  onChangeMethod,
  onChangeAmount,
}: ControllerCheckoutProps) {
  const { amount, usdcToken, hasInsufficientBalance, execute, onComplete } =
    useControllerRail();

  const [status, setStatus] = useState<ControllerCheckoutStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const isProcessing = status === "processing";
  const isSuccess = status === "success";

  const handleDeposit = useCallback(async () => {
    if (!amount) return;
    setError(null);
    setStatus("processing");
    try {
      await execute();
      setStatus("success");
    } catch (e) {
      console.error(`USD deposit error:`, e);
      setError((e instanceof Error ? e : new Error(String(e))).message);
      setStatus("error");
    }
  }, [amount, execute]);

  // Settlement is synchronous for the controller rail (execute resolves once the
  // sweeper confirms), so hand off to the host as soon as we reach success.
  useEffect(() => {
    if (isSuccess) onComplete();
  }, [isSuccess, onComplete]);

  const canDeposit = !!amount && !hasInsufficientBalance && status === "idle";

  if (isProcessing || isSuccess) {
    return (
      <>
        <ConfirmingTransaction title="Purchasing..." status="loading" />
        <Button disabled={isProcessing} onClick={onComplete}>
          CONTINUE
        </Button>
      </>
    );
  }

  return (
    <CheckoutReviewContent
      paymentMethod={paymentMethod}
      amount={amount}
      onChangeMethod={onChangeMethod}
      onChangeAmount={onChangeAmount}
      costToken={usdcToken}
      costValue={
        <span className="text-foreground-100">{amount.toFixed(2)}</span>
      }
      warning={
        hasInsufficientBalance ? (
          <ErrorCard
            variant="warning"
            title="Insufficient Balance"
            message="You need more USDC to complete this purchase."
          />
        ) : undefined
      }
      error={error}
      buttonLabel="DEPOSIT USD"
      onContinue={handleDeposit}
      buttonDisabled={!canDeposit}
    />
  );
}
