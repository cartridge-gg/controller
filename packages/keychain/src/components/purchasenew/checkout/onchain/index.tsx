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
    incrementQuantity,
    decrementQuantity,
    onOnchainPurchase,
    onSendDeposit,
  } = useOnchainPurchaseContext();

  const [isLoading, setIsLoading] = useState(false);

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
    if (bridgeFrom !== null) return false;

    return (
      !hasSufficientBalance ||
      isLoadingBalance ||
      !!balanceError ||
      isFetchingConversion
    );
  }, [
    bridgeFrom,
    hasSufficientBalance,
    isLoadingBalance,
    balanceError,
    isFetchingConversion,
  ]);

  const showInsufficientBalance =
    !isLoadingBalance && !hasSufficientBalance && !balanceError;

  const showConversionError = conversionError && needsConversion;

  const handleWalletSelect = useCallback(() => {
    //const methods = "starknet;ethereum;base;arbitrum;optimism";
    const methods = "starknet";
    navigate(`/purchase/network/${methods}`);
  }, [navigate]);

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
        {displayError && <ControllerErrorAlert error={displayError} />}

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

            <WalletSelector
              walletName={wallet.name}
              walletIcon={wallet.subIcon}
              bridgeFrom={bridgeFrom}
              onClick={handleWalletSelect}
            />

            <OnchainCostBreakdown quote={quote} />

            <QuantityControls
              quantity={quantity}
              isLoading={isLoading}
              isSendingDeposit={isSendingDeposit}
              globalDisabled={globalDisabled}
              hasSufficientBalance={hasSufficientBalance}
              bridgeFrom={bridgeFrom}
              onIncrement={incrementQuantity}
              onDecrement={decrementQuantity}
              onPurchase={handlePurchase}
              onBridge={onSendDeposit}
            />
          </>
        )}
      </LayoutFooter>
    </>
  );
}
