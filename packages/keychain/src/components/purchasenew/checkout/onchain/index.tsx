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
import { useFeature, useFeatures } from "@/hooks/features";
import {
  exceedsLimit,
  useTokenBalance,
  useTokenFallback,
} from "@/hooks/starterpack";
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
import { CoinflowDrawer } from "../coinflow/drawer";
import { CoinbaseDrawer } from "../coinbase/drawer";
import { CoinbasePopupStatus } from "../coinbase/popup-status";
import { USDC_ADDRESSES } from "@/utils/ekubo";
import { getIpLocation } from "@/utils/ip";
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
    purchaseDescription,
    quantity,
    selectedWallet,
    walletAddress,
    selectedToken,
    setSelectedToken,
    availableTokens,
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
    isCoinflowSelected,
    onCoinflowSelect,
    onCreateCoinbaseOrder,
    isCreatingOrder,
    usdAmount,
    coinbaseLimits,
    isFetchingCoinbaseLimits,
    fetchCoinbaseLimits,
  } = useOnchainPurchaseContext();
  const { onCreditCardPurchase, isCoinflowLoading } =
    useCreditPurchaseContext();

  const { refetch: refetchMe } = useMeQuery(undefined, { enabled: false });
  const { refetch: refetchAccountPrivate } = useAccountPrivateQuery(undefined, {
    enabled: false,
  });
  const isCoinflowEnabled = useFeature("coinflow-support");
  const { enableFeature } = useFeatures();

  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCoinflowDrawerOpen, setIsCoinflowDrawerOpen] = useState(false);
  const [isCoinbaseDrawerOpen, setIsCoinbaseDrawerOpen] = useState(false);
  const [showCoinbasePopupStatus, setShowCoinbasePopupStatus] = useState(false);
  const [countryCode, setCountryCode] = useState<string | null>(null);

  useEffect(() => {
    getIpLocation().then((geo) => setCountryCode(geo.countryCode));
  }, []);

  // Triple-click on the header icon unlocks the hidden fiat payment options
  // (Coinflow credit card + Apple Pay) and selects Coinflow.
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const handleIconTripleClick = useCallback(() => {
    clickCountRef.current += 1;
    clearTimeout(clickTimerRef.current);
    if (clickCountRef.current === 3) {
      clickCountRef.current = 0;
      enableFeature("coinflow-support");
      enableFeature("apple-pay-support");
      onCoinflowSelect();
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 500);
    }
  }, [enableFeature, onCoinflowSelect]);

  const totalUsdAmount = useMemo(() => {
    return usdAmount * quantity;
  }, [usdAmount, quantity]);

  const isApplePayAmountTooLow = useMemo(() => {
    return isApplePaySelected && totalUsdAmount < 1.86;
  }, [isApplePaySelected, totalUsdAmount]);

  // Pre-fetch Coinbase limits as soon as Apple Pay is selected so we can gate
  // the Buy button and skip a doomed order-create for users over the cap.
  useEffect(() => {
    if (isApplePaySelected) {
      fetchCoinbaseLimits();
    }
  }, [isApplePaySelected, fetchCoinbaseLimits]);

  const applePayLimitsLoading = useMemo(
    () => isApplePaySelected && !coinbaseLimits && isFetchingCoinbaseLimits,
    [isApplePaySelected, coinbaseLimits, isFetchingCoinbaseLimits],
  );
  const applePayLimitExceeded = useMemo(
    () =>
      isApplePaySelected &&
      !!coinbaseLimits &&
      exceedsLimit(totalUsdAmount, coinbaseLimits),
    [isApplePaySelected, coinbaseLimits, totalUsdAmount],
  );

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
    return quote ? quote.totalCost === BigInt(0) : undefined;
  }, [quote]);

  const isCoinflowStarterpackSupported = useMemo(() => {
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

  const { isCheckingFallback } = useTokenFallback({
    controller,
    starterpackDetails: starterpackDetails as
      | Parameters<typeof useTokenFallback>[0]["starterpackDetails"]
      | undefined,
    availableTokens,
    selectedToken,
    hasSufficientBalance,
    isLoadingBalance,
    balanceError,
    quantity,
    isCoinflowSelected,
    isApplePaySelected,
    selectedPlatform,
    setSelectedToken,
  });

  const globalDisabled = useMemo(() => {
    if (isCoinflowSelected) {
      return !isCoinflowStarterpackSupported || isCoinflowLoading;
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
    isCoinflowSelected,
    isCoinflowStarterpackSupported,
    isCoinflowLoading,
  ]);

  const showInsufficientBalance =
    !isLoadingBalance &&
    !hasSufficientBalance &&
    !balanceError &&
    !bridgeFrom &&
    !isApplePaySelected &&
    !isCoinflowSelected &&
    !isCheckingFallback;

  const showConversionError =
    conversionError &&
    needsConversion &&
    !isApplePaySelected &&
    !isCoinflowSelected;

  const showBridgeAmountTooLow =
    !isCoinflowSelected &&
    (feeEstimationError?.message?.includes("too low") ?? false);

  const handleWalletSelect = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const handlePurchase = useCallback(async () => {
    if (isApplePayAmountTooLow) return;
    if (isCoinflowSelected) {
      if (!isCoinflowStarterpackSupported) return;
    } else if (!hasSufficientBalance && !isFree && !isApplePaySelected) {
      console.warn("no means to pay");
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      if (isCoinflowSelected) {
        const { data: meData } = await refetchMe();
        if (!meData?.me?.email) {
          navigate("/purchase/verification?method=coinflow");
          return;
        }

        await onCreditCardPurchase();
        setIsCoinflowDrawerOpen(true);
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

        // User is over the Coinbase cap — skip the order create entirely;
        // the drawer will surface the verify flow.
        if (applePayLimitExceeded) {
          setIsCoinbaseDrawerOpen(true);
          return;
        }

        try {
          await onCreateCoinbaseOrder();
        } catch (err) {
          // Safety net: Coinbase can still reject if /limits was stale.
          // Open the drawer anyway so the verify flow takes over.
          const message = err instanceof Error ? err.message : String(err);
          if (
            message.includes("guest_transaction_count") ||
            message.includes("guest_transaction_limit")
          ) {
            await fetchCoinbaseLimits();
            setIsCoinbaseDrawerOpen(true);
            return;
          }
          throw err;
        }
        setIsCoinbaseDrawerOpen(true);
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
    isCoinflowSelected,
    isCoinflowStarterpackSupported,
    isApplePaySelected,
    applePayLimitExceeded,
    fetchCoinbaseLimits,
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

  // Restore last payment method from localStorage
  const hasRestoredMethod = useRef(false);
  useEffect(() => {
    if (hasRestoredMethod.current || !controller || !quote) return;
    hasRestoredMethod.current = true;
    try {
      const lastMethod = localStorage.getItem(
        `@cartridge/lastPaymentMethod:${controller.chainId()}`,
      );
      if (
        lastMethod === "coinflow" &&
        isCoinflowEnabled &&
        isCoinflowStarterpackSupported &&
        countryCode === "US"
      ) {
        onCoinflowSelect();
      }
    } catch {
      // localStorage may be unavailable
    }
  }, [
    controller,
    quote,
    isCoinflowEnabled,
    isCoinflowStarterpackSupported,
    onCoinflowSelect,
    countryCode,
  ]);

  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  if (isStarterpackLoading || !quote) {
    return <LoadingState />;
  }

  // Coinbase popup is active — take over the screen until payment resolves
  // (navigates to /pending) or the user backs out.
  if (showCoinbasePopupStatus) {
    return (
      <CoinbasePopupStatus onBack={() => setShowCoinbasePopupStatus(false)} />
    );
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
          title={`You Receive ${quantity > 1 ? `(${quantity})` : ""}`}
          items={purchaseItems}
          isFree={isFree}
          description={purchaseDescription}
        />
      </LayoutContent>

      <LayoutFooter>
        {displayError && !showBridgeAmountTooLow && (
          <ControllerErrorAlert error={displayError} />
        )}

        {socialClaimConditions ? (
          <SocialClaimCheckout
            bundleId={(starterpackDetails as OnchainStarterpackDetails).id}
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

            {isCoinflowSelected && !isCoinflowStarterpackSupported && (
              <ErrorCard
                variant="error"
                title="Credit Card Checkout Unavailable"
                message="Credit card checkout is only available for starterpacks priced in USDC."
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
                isCoinflowSelected
                  ? "Credit Card"
                  : isApplePaySelected
                    ? "Apple Pay"
                    : wallet.name
              }
              walletIcon={
                isCoinflowSelected ? (
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
                isCheckingFallback ||
                (bridgeFrom !== null && isFetchingFees) ||
                isCreatingOrder ||
                isCoinflowLoading ||
                applePayLimitsLoading
              }
              isSendingDeposit={isSendingDeposit}
              globalDisabled={globalDisabled}
              hasSufficientBalance={
                hasSufficientBalance || isApplePaySelected || isCoinflowSelected
              }
              bridgeFrom={bridgeFrom}
              onIncrement={incrementQuantity}
              onDecrement={decrementQuantity}
              onPurchase={handlePurchase}
              onBridge={handleBridge}
              isApplePayAmountTooLow={isApplePayAmountTooLow}
              purchaseLabel={
                isCoinflowSelected
                  ? "Continue"
                  : applePayLimitExceeded
                    ? "Verify to continue"
                    : undefined
              }
            />
          </>
        )}
      </LayoutFooter>

      <WalletSelectionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        showFiatOptions={countryCode === "US"}
      />

      <CoinflowDrawer
        isOpen={isCoinflowDrawerOpen}
        onClose={() => setIsCoinflowDrawerOpen(false)}
      />

      <CoinbaseDrawer
        isOpen={isCoinbaseDrawerOpen}
        onClose={() => setIsCoinbaseDrawerOpen(false)}
        onPopupOpened={() => {
          setIsCoinbaseDrawerOpen(false);
          setShowCoinbasePopupStatus(true);
        }}
      />
    </>
  );
}
