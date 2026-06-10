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
import { useConnection } from "@/hooks/connection";
import {
  createStarknetCryptoPayment,
  waitForCryptoPaymentConfirmation,
} from "@/hooks/payments/crypto";
import { USDC_ADDRESSES, USDC_ICON } from "@/utils/ekubo";
import { formatCredits, usdToCreditUnits, usdToUsdcWei } from "@/utils/credits";
import type { TokenOption } from "@/context";
import { CallData, cairo } from "starknet";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorCard } from "../purchase/checkout/onchain/error";

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: PaymentMethodSelection | null;
  amount: number;
  onChangeMethod: () => void;
  onChangeAmount: () => void;
}

export function CheckoutDrawer({
  isOpen,
  onClose,
  paymentMethod,
  amount,
  onChangeMethod,
  onChangeAmount,
}: CheckoutDrawerProps) {
  const { credits, tokens } = useTokens();
  const { controller, isMainnet } = useConnection();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // $1 of credits is always $1 of USDC, so while USDC is the only rail we can
  // build the quote locally (1:1) — no backend quote needed. Future rails
  // (other tokens, Coinflow, Apple Pay) will swap this for a real quote and an
  // expanded token list; CostBreakdown stays the same.
  const usdcToken = useMemo<TokenOption>(
    () => ({
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      address: controller
        ? (USDC_ADDRESSES[controller.chainId()] ?? "usdc")
        : "usdc",
      icon: USDC_ICON,
      contract: {} as TokenOption["contract"],
    }),
    [controller],
  );

  const amountInUsdcWei = useMemo(() => usdToUsdcWei(amount), [amount]);

  // initialize
  useEffect(() => {
    setIsPurchasing(false);
    setError(null);
  }, [isOpen]);

  // Paying with the controller means it fronts USDC, so the relevant balance to
  // gate on is the controller's USDC — mirror the onchain checkout's
  // insufficient-balance warning. useTokens() keeps balances refreshed, so read
  // it from there (amount is USD, 1 USDC = $1).
  const usdcBalance = useMemo<number | undefined>(() => {
    if (usdcToken.address === "usdc") return undefined;
    const match = tokens.find((t) => {
      try {
        return (
          BigInt(t.metadata.address || "0x0") === BigInt(usdcToken.address)
        );
      } catch {
        return false;
      }
    });
    return match?.balance.amount ?? 0;
  }, [tokens, usdcToken.address]);

  const hasInsufficientBalance =
    usdcBalance !== undefined && usdcBalance < amount;

  const handlePurchaseWithController = useCallback(async () => {
    if (!controller || !amount || paymentMethod?.type !== "controller") return;

    setIsPurchasing(true);
    setError(null);
    try {
      // Deposit model (credits-unification Phase 1b): create a crypto payment,
      // send USDC from the controller to its derived deposit address, then poll
      // until the sweeper grants the account credits.
      const payment = await createStarknetCryptoPayment({
        tokenAddress: usdcToken.address,
        tokenAmount: amountInUsdcWei,
        isMainnet,
      });

      await controller.execute([
        {
          contractAddress: usdcToken.address,
          entrypoint: "transfer",
          calldata: CallData.compile({
            recipient: payment.depositAddress,
            amount: cairo.uint256(amountInUsdcWei),
          }),
        },
      ]);

      await waitForCryptoPaymentConfirmation(payment.id);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsPurchasing(false);
    }
  }, [
    controller,
    amount,
    paymentMethod,
    usdcToken.address,
    amountInUsdcWei,
    isMainnet,
    onClose,
  ]);

  const canPurchase =
    !!amount && !!paymentMethod && !hasInsufficientBalance && !!controller;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} className="gap-4">
      <DrawerContent title="Buy Credits" icon={<DepositIcon variant="solid" />}>
        <TokenCard
          image={credits.metadata.image}
          title={credits.metadata.name}
          value={`$${amount.toFixed(2)}`}
          amount={`${formatCredits(usdToCreditUnits(amount)).formatted} Credits`}
          onClick={onChangeAmount}
        />

        {hasInsufficientBalance && (
          <ErrorCard
            variant="warning"
            title="Insufficient Balance"
            message="You need more USDC to complete this purchase."
          />
        )}

        <WalletSelector method={paymentMethod} onClick={onChangeMethod} />

        <CostBreakdown
          tokens={[usdcToken]}
          selectedToken={usdcToken}
          onSelectToken={() => {}}
          tokenSelectDisabled
          value={
            <span className="text-foreground-100">{amount.toFixed(2)}</span>
          }
        />

        {error && (
          <ErrorAlert title="Purchase Failed" description={error.message} />
        )}

        <Button
          disabled={!canPurchase}
          isLoading={isPurchasing}
          onClick={() => {
            handlePurchaseWithController();
          }}
        >
          BUY CREDITS
        </Button>
      </DrawerContent>
    </Drawer>
  );
}
