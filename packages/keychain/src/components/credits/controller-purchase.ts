import { useCallback, useMemo } from "react";
import { CallData, cairo } from "starknet";
import { useTokens } from "@/hooks/token";
import { useConnection } from "@/hooks/connection";
import {
  createStarknetCryptoPayment,
  waitForCryptoPaymentConfirmation,
} from "@/hooks/payments/crypto";
import { usdToUsdcWei } from "@/utils/credits";
import type { TokenOption } from "@/context";

// Encapsulates the controller (USDC) payment rail: the controller's USDC
// balance used to gate the purchase, and the transaction that fronts USDC to a
// derived deposit address. Lives here so CheckoutDrawer stays focused on UI.
export function useControllerPurchase({
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

  const hasInsufficientBalance =
    usdcBalance !== undefined && usdcBalance < amount;

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

  return { usdcBalance, hasInsufficientBalance, handlePurchaseWithController };
}
