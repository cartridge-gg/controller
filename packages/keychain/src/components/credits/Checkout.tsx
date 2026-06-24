import { useCallback, useEffect, useMemo, useState } from "react";
import { useTokens } from "@/hooks/token";
import { useConnection } from "@/hooks/connection";
import { USDC_ADDRESSES, USDC_ICON } from "@/utils/ekubo";
import type { TokenOption } from "@/context";
import type { PaymentMethodSelection } from "@/components/purchase/checkout/onchain/wallet-drawer";
// import { useIdentityContext } from "@/components/identity/provider";
import { VerificationDrawer } from "../purchase/verification/drawer";
import { useCreditsContext } from "./provider";
import { useControllerPurchase } from "./controller-purchase";
import { CheckoutDrawer } from "./CheckoutDrawer";

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: PaymentMethodSelection | null;
  amount: number;
  onChangeMethod: () => void;
  onChangeAmount: () => void;
}

/** Container for the checkout step: owns the purchase logic and routes between
 * the controller (USDC) review drawer and the Apple Pay (Coinbase) flow. The
 * UI is rendered by the presentational CheckoutDrawer. */
export function Checkout({
  isOpen,
  onClose,
  paymentMethod,
  amount,
  onChangeMethod,
  onChangeAmount,
}: CheckoutProps) {
  const { credits } = useTokens();
  const { controller } = useConnection();
  const [error, setError] = useState<string | null>(null);
  const { onDepositStarted, onDepositFinished, depositInProgress } =
    useCreditsContext();
  // const { isEmailVerified, isPhoneNumberVerified } = useIdentityContext();

  // An in-progress deposit carries its own method/amount so the right rail
  // keeps rendering while bridging.
  const activeMethod = depositInProgress?.paymentMethod ?? paymentMethod;
  const activeAmount = depositInProgress?.amount || amount;

  const isController = activeMethod?.type === "controller";
  const isApplePay = activeMethod?.type === "apple-pay";
  const isCoinFlow = activeMethod?.type === "coinflow";

  const needsVerification = false;

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

  const { hasInsufficientBalance, handlePurchaseWithController } =
    useControllerPurchase({ usdcToken, amount: activeAmount });

  // reset transient state when (re)entering the checkout step
  useEffect(() => {
    setError(null);
  }, [isOpen]);

  const isProcessing = depositInProgress?.status === "processing";
  const isSuccess = depositInProgress?.status === "success";

  // auto close on success
  useEffect(() => {
    if (isSuccess && isOpen) {
      onClose();
    }
  }, [isSuccess, isOpen, onClose]);

  // main payment switcher
  const handlePurchase = useCallback(async () => {
    if (!activeMethod || !activeAmount) return;
    onDepositStarted(activeMethod, activeAmount);
    setError(null);
    try {
      if (isController) {
        await handlePurchaseWithController();
      }
      await onDepositFinished();
      console.log(`USD deposit successful.`);
      await credits.refetch?.();
    } catch (e) {
      console.error(`USD deposit error:`, e);
      const error = (e instanceof Error ? e : new Error(String(e))).message;
      await onDepositFinished(error);
      setError(error);
    }
  }, [
    activeMethod,
    activeAmount,
    isController,
    credits,
    handlePurchaseWithController,
    onDepositStarted,
    onDepositFinished,
  ]);

  const canPurchase = useMemo(() => {
    if (!activeAmount || !activeMethod || isProcessing) {
      return false;
    }
    if (isController) {
      return !hasInsufficientBalance && !!controller;
    }
    if (isApplePay) {
      return false;
    }
    if (isCoinFlow) {
      return false;
    }
    return false;
  }, [
    activeAmount,
    activeMethod,
    isProcessing,
    isController,
    isApplePay,
    isCoinFlow,
    hasInsufficientBalance,
    controller,
  ]);

  return (
    <>
      <CheckoutDrawer
        isOpen={isOpen}
        onClose={onClose}
        paymentMethod={activeMethod}
        amount={activeAmount}
        usdcToken={usdcToken}
        hasInsufficientBalance={hasInsufficientBalance}
        error={error}
        isProcessing={isProcessing}
        isSuccess={isSuccess}
        canPurchase={canPurchase}
        onChangeMethod={onChangeMethod}
        onChangeAmount={onChangeAmount}
        handlePurchase={handlePurchase}
      />

      <VerificationDrawer
        isOpen={isOpen && needsVerification}
        method="apple-pay"
        onClose={() => {
          // Canceled verification — back to the payment method picker.
          onChangeMethod();
          onChangeAmount();
        }}
        onSuccess={() => {
          // Verified — refetchUserData (run by the identity drawers) flips
          // needsVerification false and the Coinbase drawer opens.
        }}
      />
    </>
  );
}
