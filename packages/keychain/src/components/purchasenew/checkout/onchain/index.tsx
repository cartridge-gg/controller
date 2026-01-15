import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  GiftIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/ui";
import {
  useNavigation,
  useStarterpackContext,
  useOnchainPurchaseContext,
  isOnchainStarterpack,
} from "@/context";
import { useConnection } from "@/hooks/connection";
import { useTokenBalance } from "@/hooks/starterpack";
import { ControllerErrorAlert } from "@/components/ErrorAlert";
import { Receiving } from "../../receiving";
import { OnchainCostBreakdown } from "../../review/cost";
import { LoadingState } from "../../loading";
import { getWallet } from "../../wallet/config";
import { ErrorCard } from "./error";
import { WalletSelector } from "./selector";
import { QuantityControls } from "./quantity";
import { WalletSelectionDrawer } from "./wallet-drawer";

export function OnchainCheckout() {
  const { navigate } = useNavigation();
  const { controller } = useConnection();
  const { isStarterpackLoading, starterpackDetails, displayError, clearError } =
    useStarterpackContext();
  const {
    isFetchingConversion,
    isSendingDeposit,
    purchaseItems,
    quantity,
    selectedWallet,
    walletAddress,
    selectedToken,
    convertedPrice,
    conversionError,
    selectedPlatform,
    feeEstimationError,
    incrementQuantity,
    decrementQuantity,
    onOnchainPurchase,
    onSendDeposit,
    isFetchingFees,
    layerswapFees,
  } = useOnchainPurchaseContext();

  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const quote = useMemo(() => {
    if (!starterpackDetails || !isOnchainStarterpack(starterpackDetails)) {
      return null;
    }
    return starterpackDetails.quote;
  }, [starterpackDetails]);

  const wallet = getWallet(selectedWallet?.type || "controller");

  const isFree = useMemo(() => {
    return quote?.totalCost === BigInt(0);
  }, [quote]);

  const {
    balanceError,
    bridgeFrom,
    hasSufficientBalance,
    isLoadingBalance,
    needsConversion,
    tokenSymbol,
  } = useTokenBalance({
    controller,
    starterpackDetails: starterpackDetails as
      | Parameters<typeof useTokenBalance>[0]["starterpackDetails"]
      | undefined,
    selectedToken,
    convertedPrice,
    selectedWallet,
    walletAddress,
    selectedPlatform,
    quantity,
  });

  const globalDisabled = useMemo(() => {
    // Disable if there's a fee estimation error (e.g., bridge amount too low)
    if (feeEstimationError) return true;

    if (bridgeFrom !== null) {
      // If bridging, wait for fees to be loaded
      return isFetchingFees || !layerswapFees;
    }

    return (
      !hasSufficientBalance ||
      isLoadingBalance ||
      !!balanceError ||
      isFetchingConversion
    );
  }, [
    feeEstimationError,
    bridgeFrom,
    hasSufficientBalance,
    isLoadingBalance,
    balanceError,
    isFetchingConversion,
    isFetchingFees,
    layerswapFees,
  ]);

  const showInsufficientBalance =
    !isLoadingBalance && !hasSufficientBalance && !balanceError && !bridgeFrom;

  const showConversionError = conversionError && needsConversion;

  const showBridgeAmountTooLow =
    feeEstimationError?.message?.includes("too low") ?? false;

  const handleWalletSelect = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const handlePurchase = useCallback(async () => {
    if (!hasSufficientBalance && !isFree) return;

    setIsLoading(true);
    clearError();

    try {
      await onOnchainPurchase();
      navigate("/purchase/pending", { reset: true });
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [hasSufficientBalance, isFree, onOnchainPurchase, navigate, clearError]);

  const handleBridge = useCallback(async () => {
    clearError();

    try {
      await onSendDeposit();
      navigate("/purchase/pending", { reset: true });
    } catch (error) {
      console.error("Bridge deposit failed:", error);
      // Ensure the error is displayed to the user
      // If the error message is "Fees not loaded", it might be transient or require user action
      if ((error as Error).message === "Fees not loaded") {
        // Force a re-render or state update if needed, though displayError should handle it if passed up
        // Currently onSendDeposit errors are caught here.
        // We should set the display error if it's not automatically handled by the context
      }
    }
  }, [onSendDeposit, navigate, clearError]);

  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  if (isStarterpackLoading || !quote) {
    return <LoadingState />;
  }

  return (
    <>
      <HeaderInner
        title={isFree ? "Claim" : "Review Purchase"}
        icon={<GiftIcon variant="solid" />}
      />

      <LayoutContent>
        <Receiving
          title={`Receiving ${quantity > 1 ? `(${quantity})` : ""}`}
          items={purchaseItems}
        />
      </LayoutContent>

      <LayoutFooter>
        {displayError && !showBridgeAmountTooLow && (
          <ControllerErrorAlert error={displayError} />
        )}

        {isFree ? (
          <Button
            className="w-full"
            isLoading={isLoading}
            onClick={handlePurchase}
          >
            Claim
          </Button>
        ) : (
          <>
            {balanceError && (
              <ErrorCard
                variant="error"
                title="Balance Check Failed"
                message={balanceError}
              />
            )}

            {showInsufficientBalance && (
              <ErrorCard
                variant="warning"
                title="Insufficient Balance"
                message={`You need more ${tokenSymbol} to complete this purchase.`}
              />
            )}

            {showConversionError && (
              <ErrorCard
                variant="error"
                title="Insufficient Liquidity"
                message={`Unable to swap to ${selectedToken?.symbol}. Try selecting a different token.`}
              />
            )}

            {showBridgeAmountTooLow && (
              <ErrorCard
                variant="warning"
                title="Amount Too Low"
                message="Bridge amount is too low for this network. Try increasing quantity or selecting a different network."
              />
            )}

            <WalletSelector
              walletName={wallet.name}
              walletIcon={wallet.subIcon}
              bridgeFrom={bridgeFrom}
              onClick={handleWalletSelect}
            />

            <OnchainCostBreakdown quote={quote} />

            <QuantityControls
              quantity={quantity}
              isLoading={isLoading || (bridgeFrom !== null && isFetchingFees)}
              isSendingDeposit={isSendingDeposit}
              globalDisabled={globalDisabled}
              hasSufficientBalance={hasSufficientBalance}
              bridgeFrom={bridgeFrom}
              onIncrement={incrementQuantity}
              onDecrement={decrementQuantity}
              onPurchase={handlePurchase}
              onBridge={handleBridge}
            />
          </>
        )}
      </LayoutFooter>

      <WalletSelectionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
