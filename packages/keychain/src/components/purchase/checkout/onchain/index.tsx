import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AppleIcon,
  Button,
  CreditCardIcon,
  GiftIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/controller-ui";
import {
  useNavigation,
  useStarterpackContext,
  useOnchainPurchaseContext,
  useCreditPurchaseContext,
  isOnchainStarterpack,
  OnchainStarterpackDetails,
} from "@/context";
import { useConnection } from "@/hooks/connection";
import { useFeature } from "@/hooks/features";
import { useTripleClick } from "@/hooks/tripple-click";
import {
  exceedsLimit,
  useTokenBalance,
  useTokenFallback,
  COINBASE_APPLE_PAY_MIN_USD,
} from "@/hooks/starterpack";
import { ControllerErrorAlert } from "@/components/ErrorAlert";
import { useWebauthnAuthentication } from "@/components/connect/create/webauthn";
import { isUnauthenticatedError } from "@/utils/bearer-token";
import { posthog } from "@/components/provider/posthog";
import { captureAnalyticsEvent, sanitizeErrorCode } from "@/types/analytics";
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
import { VerificationDrawer } from "../../verification/drawer";
import { USDC_ADDRESSES } from "@/utils/ekubo";
import { getIpLocation } from "@/utils/ip";
import { num } from "starknet";
import { useIdentityContext } from "@/components/identity/provider";

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
    resetCoinbasePurchase,
    isCreatingOrder,
    usdAmount,
    coinbaseLimits,
    isFetchingCoinbaseLimits,
    fetchCoinbaseLimits,
    applePayMinQuantity,
  } = useOnchainPurchaseContext();
  const { onCreditCardPurchase, isCoinflowLoading } =
    useCreditPurchaseContext();

  const { isEmailVerified, isPhoneNumberVerified, refetchUserData } =
    useIdentityContext();
  const { loginViaPopup: loginWithWebauthnPopup } = useWebauthnAuthentication();
  const isCoinflowEnabled = useFeature("coinflow-support");

  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCoinflowDrawerOpen, setIsCoinflowDrawerOpen] = useState(false);
  const [isCoinbaseDrawerOpen, setIsCoinbaseDrawerOpen] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<
    "coinflow" | "apple-pay" | null
  >(null);
  const [countryCodeLoaded, setCountryCodeLoaded] = useState<boolean>(false);
  const [countryCode, setCountryCode] = useState<string | null>(null);

  useEffect(() => {
    getIpLocation()
      .then((geo) => setCountryCode(geo.countryCode))
      .catch((e) => console.error(`getIpLocation failed`, e))
      .finally(() => setCountryCodeLoaded(true));
  }, []);

  const handleIconTripleClick = useTripleClick({
    featureName: "coinflow-support",
    callback: onCoinflowSelect,
  });

  const totalUsdAmount = useMemo(() => {
    return usdAmount * quantity;
  }, [usdAmount, quantity]);

  // Derive the actual USDC the user will onramp. For non-USDC payment tokens
  // convertedPrice.amount is the USDC equivalent from useTokenSelection's Ekubo
  // quote, which usdAmount/totalUsdAmount (computed from totalCost/1e6) does not
  // reflect. Fall back to totalUsdAmount when no converted price is available.
  const totalUsdcAmount = useMemo(() => {
    if (
      isApplePaySelected &&
      convertedPrice &&
      convertedPrice.quantity === quantity
    ) {
      return (
        Number(convertedPrice.amount) /
        10 ** convertedPrice.tokenMetadata.decimals
      );
    }
    return totalUsdAmount;
  }, [isApplePaySelected, convertedPrice, quantity, totalUsdAmount]);

  const isApplePayAmountTooLow = useMemo(() => {
    return (
      isApplePaySelected &&
      applePayMinQuantity === undefined &&
      totalUsdcAmount < COINBASE_APPLE_PAY_MIN_USD
    );
  }, [isApplePaySelected, applePayMinQuantity, totalUsdcAmount]);

  // Pre-fetch Coinbase limits as soon as Apple Pay is selected so we can gate
  // the Buy button and skip a doomed order-create for users over the cap.
  // Skip when the user lacks a verified phone — the limits query requires one
  // and would error; handlePurchase will route those users to verification.
  useEffect(() => {
    if (isApplePaySelected && isPhoneNumberVerified) {
      fetchCoinbaseLimits();
    }
  }, [isApplePaySelected, isPhoneNumberVerified, fetchCoinbaseLimits]);

  const applePayLimitsLoading = useMemo(
    () => isApplePaySelected && !coinbaseLimits && isFetchingCoinbaseLimits,
    [isApplePaySelected, coinbaseLimits, isFetchingCoinbaseLimits],
  );
  const applePayLimitExceeded = useMemo(
    () =>
      isApplePaySelected &&
      !!coinbaseLimits &&
      exceedsLimit(totalUsdcAmount, coinbaseLimits),
    [isApplePaySelected, coinbaseLimits, totalUsdcAmount],
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

  // Bearer-token expiry on the iframe surfaces here as an Authentication
  // Required error. Re-mint via the popup-backed login (cookie session is
  // first-party there), then clear the error and refetch — the user can
  // continue without leaving the screen.
  const needsReauth = useMemo(
    () => isUnauthenticatedError(displayError),
    [displayError],
  );
  const [isSigningIn, setIsSigningIn] = useState(false);
  const handleSignIn = useCallback(async () => {
    if (!controller) return;
    setIsSigningIn(true);
    try {
      await loginWithWebauthnPopup(controller.username());
      clearError();
      await refetchUserData();
    } catch (e) {
      console.error("Re-auth popup failed:", e);
    } finally {
      setIsSigningIn(false);
    }
  }, [controller, loginWithWebauthnPopup, clearError, refetchUserData]);

  const purchaseInFlightRef = useRef(false);
  const handlePurchase = useCallback(async () => {
    if (purchaseInFlightRef.current) return;
    if (isApplePayAmountTooLow) return;
    if (isCoinflowSelected) {
      if (!isCoinflowStarterpackSupported) return;
    } else if (!hasSufficientBalance && !isFree && !isApplePaySelected) {
      console.warn("no means to pay");
      return;
    }

    purchaseInFlightRef.current = true;

    const method = isCoinflowSelected
      ? "coinflow"
      : isApplePaySelected
        ? "apple-pay"
        : "onchain";
    captureAnalyticsEvent(posthog, "purchase_checkout_started", { method });

    setIsLoading(true);
    clearError();

    try {
      if (isCoinflowSelected) {
        if (!isEmailVerified) {
          setVerificationMethod("coinflow");
          return;
        }

        await onCreditCardPurchase();
        setIsCoinflowDrawerOpen(true);
      } else if (isApplePaySelected) {
        resetCoinbasePurchase();

        if (!isEmailVerified || !isPhoneNumberVerified) {
          setVerificationMethod("apple-pay");
          return;
        }

        // User is over the Coinbase cap — skip the order create entirely;
        // the drawer will surface the verify flow.
        if (applePayLimitExceeded) {
          setIsCoinbaseDrawerOpen(true);
          return;
        }

        try {
          await onCreateCoinbaseOrder({ force: true });
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
      captureAnalyticsEvent(posthog, "purchase_failed", {
        method,
        error_code: sanitizeErrorCode(error),
        stage: "checkout",
      });
    } finally {
      setIsLoading(false);
      purchaseInFlightRef.current = false;
    }
  }, [
    hasSufficientBalance,
    isFree,
    isCoinflowSelected,
    isCoinflowStarterpackSupported,
    isApplePaySelected,
    applePayLimitExceeded,
    fetchCoinbaseLimits,
    resetCoinbasePurchase,
    onCreditCardPurchase,
    isPhoneNumberVerified,
    isEmailVerified,
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

  if (isStarterpackLoading || !quote || !countryCodeLoaded) {
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
          title={`You Receive ${quantity > 1 ? `(${quantity})` : ""}`}
          items={purchaseItems}
          isFree={isFree}
          description={purchaseDescription}
        />
      </LayoutContent>

      <LayoutFooter>
        {needsReauth ? (
          <>
            <ErrorCard
              variant="warning"
              title="Sign in required"
              message="Your session has expired. Please sign in again to complete your purchase."
            />
            <Button
              className="w-full"
              isLoading={isSigningIn}
              onClick={handleSignIn}
            >
              Sign in
            </Button>
          </>
        ) : (
          <>
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

                {isApplePaySelected && applePayMinQuantity !== undefined && (
                  <ErrorCard
                    variant="warning"
                    title="Quantity Adjusted"
                    message={`Quantity set to ${applePayMinQuantity} to meet the $2.00 Apple Pay minimum.`}
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
                    hasSufficientBalance ||
                    isApplePaySelected ||
                    isCoinflowSelected
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
      />

      <VerificationDrawer
        isOpen={verificationMethod !== null}
        method={verificationMethod}
        onClose={() => setVerificationMethod(null)}
        onSuccess={() => {
          // Verification done — close drawer and re-run the purchase which
          // will now pass the email/phone gate and open the payment drawer.
          setVerificationMethod(null);
          handlePurchase();
        }}
      />
    </>
  );
}
