import { useCallback, useEffect, useState } from "react";
import { Button, TokenCard } from "@cartridge/controller-ui";
import { useTokens } from "@/hooks/token";
import { formatCredits, usdToCreditUnits } from "@/utils/credits";
import { ErrorAlert } from "@/components/ErrorAlert";
import { ConfirmingTransaction } from "@/components/purchase/pending/confirming-transaction";
import { CostBreakdown } from "@/components/purchase/review/cost";
import { WalletSelector } from "@/components/purchase/checkout/onchain/selector";
import { ErrorCard } from "@/components/purchase/checkout/onchain/error";
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
 * idle|processing|success|error status machine and renders the deposit review —
 * mirroring how `CoinbaseCheckout` / `CoinflowForm` own their rail UI. All
 * purchase data + the deposit action come from `useControllerRail()`; the host
 * only supplies the neutral rail value and the change-method/amount chrome.
 */
export function ControllerCheckout({
  paymentMethod,
  onChangeMethod,
  onChangeAmount,
}: ControllerCheckoutProps) {
  const { credits } = useTokens();
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
    <>
      <TokenCard
        image={credits.metadata.image}
        title={credits.metadata.name}
        value={`$${amount.toFixed(2)}`}
        amount={`${formatCredits(usdToCreditUnits(amount)).formatted} USD`}
        onClick={onChangeAmount}
        clickable
        className="rounded"
      />

      <WalletSelector method={paymentMethod} onClick={onChangeMethod} />

      {hasInsufficientBalance && (
        <ErrorCard
          variant="warning"
          title="Insufficient Balance"
          message="You need more USDC to complete this purchase."
        />
      )}

      {error && <ErrorAlert title="Purchase Failed" description={error} />}

      <CostBreakdown
        tokens={[usdcToken]}
        selectedToken={usdcToken}
        onSelectToken={() => {}}
        tokenSelectDisabled
        value={<span className="text-foreground-100">{amount.toFixed(2)}</span>}
      />

      <Button disabled={!canDeposit} onClick={handleDeposit}>
        DEPOSIT USD
      </Button>
    </>
  );
}
