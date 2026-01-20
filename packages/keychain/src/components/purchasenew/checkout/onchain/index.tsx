import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AppleIcon,
  Button,
  GiftIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/ui";
import { useMeQuery } from "@cartridge/ui/utils/api/cartridge";
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
  const {
    isStarterpackLoading,
    starterpackDetails,
    displayError,
    clearError,
    setDisplayError,
  } = useStarterpackContext();
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
    isApplePaySelected,
    onCreateCoinbaseOrder,
    isCreatingOrder,
    usdAmount,
  } = useOnchainPurchaseContext();

  const { refetch: refetchMe } = useMeQuery(undefined, { enabled: false });

  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const totalUsdAmount = useMemo(() => {
    return usdAmount * quantity;
  }, [usdAmount, quantity]);

  const isApplePayAmountTooLow = useMemo(() => {
    return isApplePaySelected && totalUsdAmount < 2;
  }, [isApplePaySelected, totalUsdAmount]);

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

    // Disable if Apple Pay amount is too low
    if (isApplePayAmountTooLow) return true;

    if (bridgeFrom !== null) {
      // If bridging, wait for fees to be loaded
      return isFetchingFees || !layerswapFees;
    }

    return (
      (!isApplePaySelected && !hasSufficientBalance) ||
      isLoadingBalance ||
      !!balanceError ||
      isFetchingConversion ||
      isCreatingOrder
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
    isCreatingOrder,
    isApplePaySelected,
    isApplePayAmountTooLow,
  ]);

  const showInsufficientBalance =
    !isLoadingBalance &&
    !hasSufficientBalance &&
    !balanceError &&
    !bridgeFrom &&
    !isApplePaySelected;

  const showConversionError =
    conversionError && needsConversion && !isApplePaySelected;

  const showBridgeAmountTooLow =
    feeEstimationError?.message?.includes("too low") ?? false;

  const handleWalletSelect = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const handlePurchase = useCallback(async () => {
    if (isApplePayAmountTooLow) return;
    if (!hasSufficientBalance && !isFree && !isApplePaySelected) return;

    setIsLoading(true);
    clearError();

    try {
      if (isApplePaySelected) {
        const { data } = await refetchMe();
        const me = data?.me;
        const needsVerification =
          !me?.email || !me?.phoneNumber || !me?.phoneNumberVerifiedAt;

        if (needsVerification) {
          navigate("/purchase/verification?method=apple-pay", {
            showClose: true,
          });
          return;
        }

        await onCreateCoinbaseOrder();
        navigate("/purchase/checkout/coinbase");
      } else {
        await onOnchainPurchase();
        navigate("/purchase/pending", { reset: true });
      }
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    hasSufficientBalance,
    isFree,
    isApplePaySelected,
    refetchMe,
    onCreateCoinbaseOrder,
    onOnchainPurchase,
    navigate,
    clearError,
    isApplePayAmountTooLow,
  ]);

  const handleBridge = useCallback(async () => {
    clearError();

    try {
      await onSendDeposit();
      navigate("/purchase/pending", { reset: true });
    } catch (error) {
      setDisplayError(error as Error);
    }
  }, [onSendDeposit, navigate, clearError, setDisplayError]);

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

            {isApplePayAmountTooLow && (
              <ErrorCard
                variant="warning"
                title="Amount Too Low"
                message="Minimum purchase amount is $2.00 for Apple Pay."
              />
            )}

            <WalletSelector
              walletName={isApplePaySelected ? "Apple Pay" : wallet.name}
              walletIcon={
                isApplePaySelected ? <AppleIcon size="xs" /> : wallet.subIcon
              }
              bridgeFrom={bridgeFrom}
              onClick={handleWalletSelect}
            />

            <OnchainCostBreakdown quote={quote} />

            <QuantityControls
              quantity={quantity}
              isLoading={
                isLoading ||
                (bridgeFrom !== null && isFetchingFees) ||
                isCreatingOrder
              }
              isSendingDeposit={isSendingDeposit}
              globalDisabled={globalDisabled}
              hasSufficientBalance={hasSufficientBalance || isApplePaySelected}
              bridgeFrom={bridgeFrom}
              onIncrement={incrementQuantity}
              onDecrement={decrementQuantity}
              onPurchase={handlePurchase}
              onBridge={handleBridge}
              isApplePayAmountTooLow={isApplePayAmountTooLow}
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
