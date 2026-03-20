import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AppleIcon,
  Button,
  CreditCardIcon,
  GiftIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/ui";
import { useMeQuery } from "@cartridge/ui/utils/api/cartridge";
import { useAccountPrivateQuery } from "@/utils/api";
import {
  useNavigation,
  useStarterpackContext,
  useOnchainPurchaseContext,
  useCreditPurchaseContext,
  isOnchainStarterpack,
  OnchainStarterpackDetails,
} from "@/context";
import { useConnection } from "@/hooks/connection";
import { useFeatures } from "@/hooks/features";
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
import { SocialClaimCheckout } from "./social-claim";
import { USDC_ADDRESSES } from "@/utils/ekubo";
import { num } from "starknet";

export function OnchainCheckout() {
  const { navigate } = useNavigation();
  const { controller } = useConnection();
  const {
    isStarterpackLoading,
    starterpackDetails,
    displayError,
    clearError,
    setDisplayError,
    socialClaimOptions,
    socialClaimConditions,
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
    isStripeSelected,
    onApplePaySelect,
    onCreateCoinbaseOrder,
    isCreatingOrder,
    usdAmount,
  } = useOnchainPurchaseContext();
  const { onCreditCardPurchase, isStripeLoading } = useCreditPurchaseContext();

  const { refetch: refetchMe } = useMeQuery(undefined, { enabled: false });
  const { refetch: refetchAccountPrivate } = useAccountPrivateQuery(undefined, {
    enabled: false,
  });
  const { enableFeature } = useFeatures();

  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Triple-click on the header icon to enable hidden payment methods.
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const handleIconTripleClick = useCallback(() => {
    clickCountRef.current += 1;
    clearTimeout(clickTimerRef.current);
    if (clickCountRef.current === 3) {
      clickCountRef.current = 0;
      enableFeature("apple-pay-support");
      onApplePaySelect();
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 500);
    }
  }, [enableFeature, onApplePaySelect]);

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

  const imageUrl = useMemo(
    () =>
      socialClaimConditions
        ? (starterpackDetails as OnchainStarterpackDetails).imageUri
        : null,
    [starterpackDetails, socialClaimConditions],
  );

  const wallet = getWallet(selectedWallet?.type || "controller");

  const isFree = useMemo(() => {
    return quote?.totalCost === BigInt(0);
  }, [quote]);

  const isStripeStarterpackSupported = useMemo(() => {
    if (!controller || !quote) {
      return true;
    }

    const usdcAddress = USDC_ADDRESSES[controller.chainId()];
    return (
      !!usdcAddress && num.toHex(quote.paymentToken) === num.toHex(usdcAddress)
    );
  }, [controller, quote]);

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
    if (isStripeSelected) {
      return !isStripeStarterpackSupported || isStripeLoading;
    }

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
    isStripeSelected,
    isStripeStarterpackSupported,
    isStripeLoading,
  ]);

  const showInsufficientBalance =
    !isLoadingBalance &&
    !hasSufficientBalance &&
    !balanceError &&
    !bridgeFrom &&
    !isApplePaySelected &&
    !isStripeSelected;

  const showConversionError =
    conversionError &&
    needsConversion &&
    !isApplePaySelected &&
    !isStripeSelected;

  const showBridgeAmountTooLow =
    !isStripeSelected &&
    (feeEstimationError?.message?.includes("too low") ?? false);

  const handleWalletSelect = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const handlePurchase = useCallback(async () => {
    if (isApplePayAmountTooLow) return;
    if (isStripeSelected) {
      if (!isStripeStarterpackSupported) return;
    } else if (!hasSufficientBalance && !isFree && !isApplePaySelected) {
      console.warn("no means to pay");
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      if (isStripeSelected) {
        await onCreditCardPurchase();

        const { data: accountPrivateData } = await refetchAccountPrivate();
        const needsVerification =
          !accountPrivateData?.accountPrivate?.proveVerifiedAt;

        if (needsVerification) {
          navigate("/purchase/verification/stripe");
        } else {
          navigate("/purchase/checkout/stripe");
        }
      } else if (isApplePaySelected) {
        const [{ data: meData }, { data: accountPrivateData }] =
          await Promise.all([refetchMe(), refetchAccountPrivate()]);
        const me = meData?.me;
        const accountPrivate = accountPrivateData?.accountPrivate;
        const needsVerification =
          !me?.email ||
          !accountPrivate?.phoneNumber ||
          !accountPrivate?.phoneNumberVerifiedAt;

        if (needsVerification) {
          navigate("/purchase/verification?method=apple-pay");
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
    isStripeSelected,
    isStripeStarterpackSupported,
    isApplePaySelected,
    onCreditCardPurchase,
    refetchMe,
    refetchAccountPrivate,
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
        title={
          socialClaimConditions
            ? `Claim ${starterpackDetails?.name}`
            : isFree
              ? "Claim"
              : "Review Purchase"
        }
        icon={
          imageUrl ? (
            <img src={imageUrl} alt={starterpackDetails?.name} />
          ) : (
            <div onClick={handleIconTripleClick}>
              <GiftIcon variant="solid" />
            </div>
          )
        }
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

        {socialClaimConditions ? (
          <SocialClaimCheckout
            options={socialClaimOptions}
            conditions={socialClaimConditions}
            isLoading={isLoading}
            handlePurchase={handlePurchase}
            isFree={isFree}
          />
        ) : isFree ? (
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

            {isStripeSelected && !isStripeStarterpackSupported && (
              <ErrorCard
                variant="error"
                title="Stripe Checkout Unavailable"
                message="Stripe checkout is only available for starterpacks priced in USDC."
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
              walletName={
                isStripeSelected
                  ? "Credit Card"
                  : isApplePaySelected
                    ? "Apple Pay"
                    : wallet.name
              }
              walletIcon={
                isStripeSelected ? (
                  <CreditCardIcon size="xs" variant="solid" />
                ) : isApplePaySelected ? (
                  <AppleIcon size="xs" />
                ) : (
                  wallet.subIcon
                )
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
                isCreatingOrder ||
                isStripeLoading
              }
              isSendingDeposit={isSendingDeposit}
              globalDisabled={globalDisabled}
              hasSufficientBalance={
                hasSufficientBalance || isApplePaySelected || isStripeSelected
              }
              bridgeFrom={bridgeFrom}
              onIncrement={incrementQuantity}
              onDecrement={decrementQuantity}
              onPurchase={handlePurchase}
              onBridge={handleBridge}
              isApplePayAmountTooLow={isApplePayAmountTooLow}
              purchaseLabel={isStripeSelected ? "Continue" : undefined}
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
