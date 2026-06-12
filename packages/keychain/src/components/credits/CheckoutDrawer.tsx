import { useCallback, useEffect, useMemo, useState } from "react";
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
import { ConfirmingTransaction } from "@/components/purchase/pending/confirming-transaction";
import { ErrorCard } from "@/components/purchase/checkout/onchain/error";
import { useCreditsContext } from "./provider";

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
  const { credits } = useTokens();
  const { controller } = useConnection();
  const [error, setError] = useState<string | null>(null);
  const { onDepositStarted, onDepositFinished, depositInProgress } =
    useCreditsContext();

  const isController = paymentMethod?.type === "controller";

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

  const { usdcBalance, handlePurchaseWithController } = useControllerPurchase({
    usdcToken,
    amount,
  });

  const hasInsufficientBalance =
    usdcBalance !== undefined && usdcBalance < amount;

  // initialize
  useEffect(() => {
    setError(null);
  }, [isOpen]);

  // main payment switcher
  const handlePurchase = useCallback(async () => {
    if (!paymentMethod || !amount) return;
    onDepositStarted(paymentMethod, amount);
    setError(null);
    try {
      if (isController) {
        await handlePurchaseWithController();
      }
      await onDepositFinished();
      console.log(`Credits purchase successful.`);
      await credits.refetch?.();
    } catch (e) {
      console.error(`Credits purchase error:`, e);
      const error = (e instanceof Error ? e : new Error(String(e))).message;
      await onDepositFinished(error);
      setError(error);
    }
  }, [
    paymentMethod,
    amount,
    isController,
    credits,
    handlePurchaseWithController,
    onDepositStarted,
    onDepositFinished,
    setError,
  ]);

  const isProcessing = depositInProgress?.status === "processing";
  const isSuccess = depositInProgress?.status === "success";

  const canPurchase = useMemo(() => {
    if (!amount || !paymentMethod || isProcessing) {
      return false;
    }
    if (isController) {
      return !hasInsufficientBalance && !!controller;
    }
    return false;
  }, [
    amount,
    paymentMethod,
    isProcessing,
    isController,
    hasInsufficientBalance,
    controller,
  ]);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} className="gap-4">
      <DrawerContent title="Buy Credits" icon={<DepositIcon variant="solid" />}>
        <TokenCard
          image={credits.metadata.image}
          title={credits.metadata.name}
          value={`$${amount.toFixed(2)}`}
          amount={`${formatCredits(usdToCreditUnits(amount)).formatted} Credits`}
          onClick={onChangeAmount}
          clickable={!isSuccess}
          className="rounded"
        />

        <WalletSelector
          method={paymentMethod}
          onClick={onChangeMethod}
          disabled={isSuccess}
        />

        {hasInsufficientBalance && (
          <ErrorCard
            variant="warning"
            title="Insufficient Balance"
            message="You need more USDC to complete this purchase."
          />
        )}

        {error && <ErrorAlert title="Purchase Failed" description={error} />}

        {isProcessing && (
          <ConfirmingTransaction
            title="Processing transaction..."
            status="loading"
          />
        )}

        {isSuccess && (
          <ConfirmingTransaction
            title="Transaction successful"
            status="success"
          />
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

        {isSuccess ? (
          <Button onClick={onClose}>CLOSE</Button>
        ) : (
          <Button
            disabled={!canPurchase}
            isLoading={isProcessing}
            onClick={handlePurchase}
          >
            BUY CREDITS
          </Button>
        )}
      </DrawerContent>
    </Drawer>
  );
}

// Encapsulates the controller (USDC) payment rail: the controller's USDC
// balance used to gate the purchase, and the transaction that fronts USDC to a
// derived deposit address. Lives here so CheckoutDrawer stays focused on UI.
function useControllerPurchase({
  usdcToken,
  amount,
}: {
  usdcToken: TokenOption;
  amount: number;
}) {
  const { tokens } = useTokens();
  const { controller, isMainnet } = useConnection();

  const amountInUsdcWei = useMemo(() => usdToUsdcWei(amount), [amount]);

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

  const handlePurchaseWithController = useCallback(async () => {
    if (!controller || !amount) return;

    // Deposit model (credits-unification Phase 1b): create a crypto payment,
    // send USDC from the controller to its derived deposit address, then poll
    // until the sweeper grants the account credits.
    const payment = await createStarknetCryptoPayment({
      tokenAddress: usdcToken.address,
      tokenAmount: amountInUsdcWei,
      isMainnet,
    });

    const calls = [
      {
        contractAddress: usdcToken.address,
        entrypoint: "transfer",
        calldata: CallData.compile({
          recipient: payment.depositAddress,
          amount: cairo.uint256(amountInUsdcWei),
        }),
      },
    ];

    // Pay gas from the controller's own native fee token (STRK) instead of
    // the paymaster: estimate the fee, then submit a direct V3 invoke with
    // that maxFee. Passing a feeSource (PAYMASTER/CREDITS) would route this
    // back through outside-execution, so we deliberately omit it.
    const maxFee = await controller.estimateInvokeFee(calls);
    const response = await controller.execute(calls, maxFee);

    const transactionHash = response.transaction_hash;
    console.log(`Credits purchase transaction:`, transactionHash);

    await waitForCryptoPaymentConfirmation(payment.id);

    // keep for testing workflow...
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    // throw new Error("Bump!");
  }, [controller, amount, usdcToken.address, amountInUsdcWei, isMainnet]);

  return { usdcBalance, handlePurchaseWithController };
}
