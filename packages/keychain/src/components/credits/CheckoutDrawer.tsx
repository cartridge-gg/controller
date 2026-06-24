import {
  Drawer,
  DrawerContent,
  DepositIcon,
  Button,
  TokenCard,
} from "@cartridge/controller-ui";
import { PaymentMethodSelection } from "@/components/purchase/checkout/onchain/wallet-drawer";
import { WalletSelector } from "@/components/purchase/checkout/onchain/selector";
import { CostBreakdown } from "@/components/purchase/review/cost";
import { ErrorAlert } from "@/components/ErrorAlert";
import { useTokens } from "@/hooks/token";
import { formatCredits, usdToCreditUnits } from "@/utils/credits";
import type { TokenOption } from "@/context";
import { ConfirmingTransaction } from "@/components/purchase/pending/confirming-transaction";
import { ErrorCard } from "@/components/purchase/checkout/onchain/error";

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: PaymentMethodSelection | null;
  amount: number;
  usdcToken: TokenOption;
  hasInsufficientBalance: boolean;
  error: string | null;
  isProcessing: boolean;
  isSuccess: boolean;
  canPurchase: boolean;
  onChangeMethod: () => void;
  onChangeAmount: () => void;
  handlePurchase: () => void;
}

/** UI-only checkout review drawer. All state and purchase logic lives in the
 * Checkout container; this component renders the review and calls back through
 * handlePurchase. */
export function CheckoutDrawer({
  isOpen,
  onClose,
  paymentMethod,
  amount,
  usdcToken,
  hasInsufficientBalance,
  error,
  isProcessing,
  isSuccess,
  canPurchase,
  onChangeMethod,
  onChangeAmount,
  handlePurchase,
}: CheckoutDrawerProps) {
  const { credits } = useTokens();

  const isController = paymentMethod?.type === "controller";
  const isApplePay = paymentMethod?.type === "apple-pay";

  return (
    <Drawer isOpen={isOpen} onClose={onClose} className="gap-4">
      <DrawerContent title="Deposit USD" icon={<DepositIcon variant="solid" />}>
        {isProcessing || isSuccess ? (
          <>
            <ConfirmingTransaction title="Purchasing..." status="loading" />

            <Button disabled={isProcessing} onClick={onClose}>
              CONTINUE
            </Button>
          </>
        ) : (
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

            {isController && hasInsufficientBalance && (
              <ErrorCard
                variant="warning"
                title="Insufficient Balance"
                message="You need more USDC to complete this purchase."
              />
            )}

            {error && (
              <ErrorAlert title="Purchase Failed" description={error} />
            )}

            <CostBreakdown
              tokens={[usdcToken]}
              selectedToken={usdcToken}
              onSelectToken={() => {}}
              tokenSelectDisabled
              value={
                <span className="text-foreground-100">{amount.toFixed(2)}</span>
              }
            />

            <Button disabled={!canPurchase} onClick={handlePurchase}>
              {isApplePay ? "CONTINUE" : "DEPOSIT USD"}
            </Button>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
