import { type ReactNode } from "react";
import { Button, TokenCard } from "@cartridge/controller-ui";
import { useTokens } from "@/hooks/token";
import { formatCredits, usdToCreditUnits } from "@/utils/credits";
import { ErrorAlert } from "@/components/ErrorAlert";
import { CostBreakdown } from "@/components/purchase/review/cost";
import { WalletSelector } from "@/components/purchase/checkout/onchain/selector";
import type { PaymentMethodSelection } from "@/components/purchase/checkout/onchain/wallet-drawer";
import type { TokenOption } from "@/context";
import { useAdvancedView } from "@/hooks/features";

interface CheckoutReviewContentProps {
  paymentMethod: PaymentMethodSelection | null;
  amount: number;
  onChangeMethod: () => void;
  onChangeAmount: () => void;
  /** Token shown in the cost-breakdown selector (USDC for controller, USD for
   * the fiat rails). */
  costToken: TokenOption;
  /** The "Total" value node — each rail computes it from its own quote/intent. */
  costValue: ReactNode;
  /** Spinner in the Total row while the quote/intent is loading. */
  isCostLoading?: boolean;
  /** Optional inline warning card (e.g. controller insufficient balance). */
  warning?: ReactNode;
  /** Error surfaced from the deposit/quote — shown above the totals. */
  error?: string | null;
  buttonLabel: string;
  onContinue: () => void;
  buttonDisabled?: boolean;
}

/**
 * Shared checkout-details review body for every credits rail (controller,
 * Coinflow, Apple Pay). Renders the amount, the selected method, an optional
 * warning, an error slot, and the totals row; the host supplies the rail-
 * specific total, error, and footer action. Rendered inside a "Deposit USD"
 * drawer by each rail's host.
 */
export function CheckoutReviewContent({
  paymentMethod,
  amount,
  onChangeMethod,
  onChangeAmount,
  costToken,
  costValue,
  isCostLoading,
  warning,
  error,
  buttonLabel,
  onContinue,
  buttonDisabled,
}: CheckoutReviewContentProps) {
  const { credits } = useTokens();
  const advancedView = useAdvancedView();

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

      {warning}

      {error && (
        <ErrorAlert
          title="Purchase Failed"
          description={
            advancedView
              ? error
              : "The purchase could not be prepared. Please try again."
          }
        />
      )}

      <CostBreakdown
        tokens={[costToken]}
        selectedToken={costToken}
        onSelectToken={() => {}}
        tokenSelectDisabled
        isLoading={isCostLoading}
        value={costValue}
      />

      <Button disabled={buttonDisabled} onClick={onContinue}>
        {buttonLabel}
      </Button>
    </>
  );
}
