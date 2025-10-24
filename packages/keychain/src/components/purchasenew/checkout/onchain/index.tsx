import { useNavigation, usePurchaseContext } from "@/context";
import {
  Button,
  GiftIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  ErrorAlertIcon,
  Card,
  CardContent,
} from "@cartridge/ui";
import { Receiving } from "../../receiving";
import { OnchainCostBreakdown } from "../../review/cost";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ControllerErrorAlert } from "@/components/ErrorAlert";
import { useConnection } from "@/hooks/connection";
import { isOnchainStarterpack } from "@/context";
import { uint256 } from "starknet";
import { tokenAmountToDecimal, getTokenSymbol } from "../../review/token-utils";

export function OnchainCheckout() {
  const {
    purchaseItems,
    displayError,
    starterpackDetails,
    clearError,
  } = usePurchaseContext();
  const { navigate } = useNavigation();
  const { controller } = useConnection();
  const [isChecking, setIsChecking] = useState(true);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Extract quote from onchain starterpack
  const quote = useMemo(() => {
    if (!starterpackDetails || !isOnchainStarterpack(starterpackDetails)) {
      return null;
    }
    return starterpackDetails.quote;
  }, [starterpackDetails]);

  // Check if user has sufficient balance
  const hasSufficientBalance = useMemo(() => {
    if (!quote || balance === null) return false;
    return balance >= quote.totalCost;
  }, [balance, quote]);

  // Fetch user's token balance
  useEffect(() => {
    const checkBalance = async () => {
      if (!controller || !quote) {
        setIsChecking(false);
        return;
      }

      try {
        setIsChecking(true);

        // Call balanceOf on the payment token contract
        const result = await controller.provider.callContract({
          contractAddress: quote.paymentToken,
          entrypoint: "balanceOf",
          calldata: [controller.address],
        });

        // Parse the u256 balance (2 felts: low, high)
        const balanceBN = uint256.uint256ToBN({
          low: result[0],
          high: result[1],
        });

        setBalance(balanceBN);
      } catch (error) {
        console.error("Failed to fetch token balance:", error);
        // Set balance to 0 on error so we show insufficient balance message
        setBalance(0n);
      } finally {
        setIsChecking(false);
      }
    };

    checkBalance();
  }, [controller, quote]);

  const onPurchase = useCallback(async () => {
    if (!quote || !hasSufficientBalance) return;

    setIsLoading(true);
    try {
      // TODO: Implement onchain purchase flow
      // This will call the starterpack contract's purchase function
      console.log("Purchasing starterpack with onchain payment");
      navigate("/purchase/pending", { reset: true });
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [quote, hasSufficientBalance, navigate]);

  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  if (!quote) {
    return (
      <ControllerErrorAlert
        error={new Error("Invalid starterpack configuration")}
      />
    );
  }

  const tokenSymbol = getTokenSymbol(quote.paymentToken);
  const balanceDisplay = balance !== null
    ? tokenAmountToDecimal(balance, quote.paymentToken).toFixed(6)
    : "...";
  const requiredDisplay = tokenAmountToDecimal(
    quote.totalCost,
    quote.paymentToken,
  ).toFixed(6);

  return (
    <>
      <HeaderInner
        title="Review Purchase"
        icon={<GiftIcon variant="solid" />}
      />
      <LayoutContent>
        <Receiving title="Receiving" items={purchaseItems} />

        {/* Balance Check Card */}
        <Card>
          <CardContent className="flex flex-col gap-2 p-3">
            <div className="flex justify-between text-sm">
              <span className="text-foreground-300">Your Balance:</span>
              <span className="font-medium">
                {balanceDisplay} {tokenSymbol}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-foreground-300">Required:</span>
              <span className="font-medium">
                {requiredDisplay} {tokenSymbol}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Insufficient Balance Warning */}
        {!isChecking && !hasSufficientBalance && (
          <Card className="border-warning">
            <CardContent className="flex flex-row items-center gap-3 p-3 text-warning">
              <ErrorAlertIcon variant="warning" size="sm" />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold">Insufficient Balance</p>
                <p className="text-xs text-foreground-300">
                  You need more {tokenSymbol} to complete this purchase. Please
                  add funds or swap tokens.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </LayoutContent>
      <LayoutFooter>
        <OnchainCostBreakdown quote={quote} />
        {displayError && <ControllerErrorAlert error={displayError} />}
        <Button
          onClick={onPurchase}
          isLoading={isLoading || isChecking}
          disabled={!hasSufficientBalance || !!displayError || isChecking}
        >
          {!hasSufficientBalance && !isChecking ? "Insufficient Balance" : "Purchase"}
        </Button>
      </LayoutFooter>
    </>
  );
}

