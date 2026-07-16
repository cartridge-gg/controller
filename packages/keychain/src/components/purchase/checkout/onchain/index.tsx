import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
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
import { useAdvancedView, useFeature } from "@/hooks/features";
import { useCoinflowIsMainnet } from "@/hooks/payments/coinflow";
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
import { ErrorCard } from "./error";
import { WalletSelector } from "./selector";
import { QuantityControls } from "./quantity";
import {
  WalletSelectionDrawer,
  type PaymentMethod,
  type PaymentMethodSelection,
} from "./wallet-drawer";
import { SocialClaimCheckout } from "./social-claim";
import { CoinflowDrawer } from "../coinflow/drawer";
import { CoinbaseDrawer } from "../coinbase/drawer";
import { VerificationDrawer } from "../../verification/drawer";
import { USDC_ADDRESSES } from "@/utils/ekubo";
import { useGeoLocation } from "@/hooks/geo";
import { num } from "starknet";
import { useIdentityContext } from "@/components/identity/provider";
import { useCreditsContext } from "@/components/credits/provider";
import {
  MAX_CREDITS_PURCHASE_USD,
  MIN_CREDITS_PURCHASE_USD,
} from "@/utils/credits";
import {
  clearPaymentPreference,
  readPaymentPreference,
  resolveInitialPaymentMethod,
} from "@/utils/payment-preference";
import {
  CreditsBalancePendingError,
  waitForCreditsBalance,
} from "@/utils/credits-settlement";
import { usePurchaseLocationGate } from "@/components/purchase/usePurchaseLocationGate";

export function OnchainCheckout() {
  const advancedView = useAdvancedView();
  const { navigate } = useNavigation();
  const { controller, origin, defaultPaymentMethod } = useConnection();
  const {
    isStarterpackLoading,
    starterpackDetails,
    displayError,
    clearError,
    setDisplayError,
    socialClaimOptions,
    socialClaimConditions,
    registryAddress,
    bundleId,
    starterpackId,
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
    onApplePaySelect,
    onExternalConnect,
    clearSelectedWallet,
    onCreateCoinbaseOrder,
    resetCoinbasePurchase,
    isCreatingOrder,
    usdAmount,
    coinbaseLimits,
    isFetchingCoinbaseLimits,
    fetchCoinbaseLimits,
    applePayMinQuantity,
    isCreditsRailSelected,
    isCreditsSelected,
    onCreditsSelect,
  } = useOnchainPurchaseContext();
  const {
    onCreditCardPurchase,
    isCoinflowLoading,
    creditsQuote,
    isCreditsQuoteLoading,
    creditsQuoteError,
    hasSufficientCredits,
    isCreditsLoading,
    onCreditsPurchase,
    refetchCreditsBalance,
    creditsBalance,
    isCreditsBalanceLoading,
    creditsBalanceError,
  } = useCreditPurchaseContext();
  const { initiateCreditsDeposit } = useCreditsContext();

  const {
    isEmailVerified,
    isPhoneNumberVerified,
    refetchUserData,
    ageGateStatus: { isAllowed, isBlocked },
  } = useIdentityContext();
  const { loginViaPopup: loginWithWebauthnPopup } = useWebauthnAuthentication();
  const isCoinflowEnabled = useFeature("coinflow-support");
  const { isCoinflowSandbox } = useCoinflowIsMainnet();

  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCoinflowDrawerOpen, setIsCoinflowDrawerOpen] = useState(false);
  const [isCoinbaseDrawerOpen, setIsCoinbaseDrawerOpen] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<
    "apple-pay" | "identity" | null
  >(null);
  const { isUS, countryCodeLoaded } = useGeoLocation();
  const configuredCard = defaultPaymentMethod === "credit-card";
  const { runAfterLocationGate, locationGateView } = usePurchaseLocationGate();

  const handleIconTripleClick = useTripleClick({
    featureName: isUS ? "coinflow-support" : undefined,
    callback: isUS ? onCoinflowSelect : undefined,
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

  // Reconstruct the shared PaymentMethod from context flags so WalletSelector
  // and the rest of the UI can render it without re-deriving name/icon. Covers
  // restored methods (e.g. coinflow from localStorage) as well as drawer picks.
  const selectedMethod = useMemo<PaymentMethod>(() => {
    if (isCoinflowSelected) return { type: "coinflow" };
    if (isApplePaySelected) return { type: "apple-pay" };
    if (isCreditsRailSelected) return { type: "credits" };
    if (selectedWallet) return { type: "external", wallet: selectedWallet };
    return { type: "controller" };
  }, [
    isCoinflowSelected,
    isApplePaySelected,
    isCreditsRailSelected,
    selectedWallet,
  ]);

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

  const { isCheckingFallback, status: tokenFundingStatus } = useTokenFallback({
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
    isCreditsSelected,
    selectedPlatform,
    setSelectedToken,
  });

  const configuredCoinflowAvailable =
    countryCodeLoaded && isUS && (isCoinflowEnabled || configuredCard);
  const rememberedPaymentMethod = useMemo(() => {
    if (!controller || !origin) return undefined;
    try {
      return readPaymentPreference({
        origin,
        chainId: controller.chainId(),
        configuredDefault: configuredCard,
      });
    } catch {
      return undefined;
    }
  }, [controller, origin, configuredCard]);

  const initialResolutionKey = useMemo(() => {
    if (!controller || !origin || !registryAddress || !starterpackDetails) {
      return "";
    }
    const details = starterpackDetails as { id?: string | number };
    const purchaseIdentity =
      bundleId !== undefined
        ? `bundle:${bundleId}`
        : `starterpack:${starterpackId ?? details.id ?? "unknown"}`;
    return [
      origin,
      controller.address(),
      controller.chainId(),
      registryAddress,
      purchaseIdentity,
    ].join(":");
  }, [
    controller,
    origin,
    registryAddress,
    starterpackDetails,
    bundleId,
    starterpackId,
  ]);
  const resolutionRef = useRef<{ key: string; applied: boolean }>({
    key: "",
    applied: false,
  });
  const [isInitialPaymentResolved, setIsInitialPaymentResolved] =
    useState(false);

  useEffect(() => {
    if (!initialResolutionKey || !quote) return;
    if (resolutionRef.current.key !== initialResolutionKey) {
      resolutionRef.current = { key: initialResolutionKey, applied: false };
      setIsInitialPaymentResolved(false);
    }
    if (resolutionRef.current.applied) return;

    if (quote.totalCost === 0n) {
      resolutionRef.current.applied = true;
      setIsInitialPaymentResolved(true);
      return;
    }

    const creditsResolution =
      isCreditsQuoteLoading ||
      isCreditsBalanceLoading ||
      (!creditsQuote && !creditsQuoteError)
        ? "pending"
        : creditsQuoteError || creditsBalanceError || !creditsQuote
          ? "unavailable"
          : "available";

    const resolution = resolveInitialPaymentMethod({
      remembered: rememberedPaymentMethod,
      configuredDefault: configuredCard,
      funding: tokenFundingStatus,
      credits: creditsResolution,
      hasSufficientCredits,
      cardTopupAvailable: configuredCoinflowAvailable,
      directCardAvailable:
        configuredCoinflowAvailable && isCoinflowStarterpackSupported,
    });
    if (resolution.status === "pending") return;

    resolutionRef.current.applied = true;
    if (resolution.method === "credits") {
      onCreditsSelect({ persist: false });
    } else if (resolution.method === "coinflow") {
      onCoinflowSelect({ persist: false });
    } else {
      clearSelectedWallet({ persist: false });
    }
    if (resolution.showMethodPicker) {
      if (rememberedPaymentMethod && controller && origin) {
        try {
          clearPaymentPreference({
            origin,
            chainId: controller.chainId(),
          });
        } catch {
          // localStorage may be unavailable
        }
      }
      setIsDrawerOpen(true);
    }
    setIsInitialPaymentResolved(true);
  }, [
    initialResolutionKey,
    quote,
    isCreditsQuoteLoading,
    isCreditsBalanceLoading,
    creditsQuote,
    creditsQuoteError,
    creditsBalanceError,
    rememberedPaymentMethod,
    configuredCard,
    tokenFundingStatus,
    hasSufficientCredits,
    configuredCoinflowAvailable,
    isCoinflowStarterpackSupported,
    onCreditsSelect,
    onCoinflowSelect,
    clearSelectedWallet,
    controller,
    origin,
  ]);

  // Insufficient credits doesn't disable the CTA — it turns into "Buy
  // Credits" and opens the top-up drawer (mirrors the Apple Pay
  // limit-exceeded → "Verify to continue" pattern).
  const showInsufficientCredits =
    isCreditsSelected &&
    !!creditsQuote &&
    !hasSufficientCredits &&
    !isCreditsQuoteLoading;
  const showConfiguredCreditsTopup = configuredCard && showInsufficientCredits;

  const globalDisabled = useMemo(() => {
    if (isCreditsSelected) {
      return (
        isCreditsQuoteLoading ||
        !!creditsQuoteError ||
        isCreditsBalanceLoading ||
        !!creditsBalanceError ||
        !creditsQuote ||
        isCreditsLoading
      );
    }

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
    isCreditsSelected,
    isCreditsQuoteLoading,
    isCreditsBalanceLoading,
    creditsQuoteError,
    creditsBalanceError,
    creditsQuote,
    isCreditsLoading,
  ]);

  const showInsufficientBalance =
    !isLoadingBalance &&
    !hasSufficientBalance &&
    !balanceError &&
    !bridgeFrom &&
    !isApplePaySelected &&
    !isCoinflowSelected &&
    !isCreditsSelected &&
    !isCheckingFallback;

  const showConversionError =
    conversionError &&
    needsConversion &&
    !isApplePaySelected &&
    !isCoinflowSelected &&
    !isCreditsSelected;

  const showBridgeAmountTooLow =
    !isCoinflowSelected &&
    (feeEstimationError?.message?.includes("too low") ?? false);

  const handleWalletSelect = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const handlePaymentMethodSelect = useCallback(
    async (method: PaymentMethodSelection) => {
      switch (method.type) {
        case "apple-pay":
          onApplePaySelect();
          break;
        case "coinflow":
          if (!isUS) return;
          onCoinflowSelect();
          break;
        case "credits":
          onCreditsSelect();
          break;
        case "controller":
          clearSelectedWallet();
          break;
        case "external":
          await onExternalConnect(
            method.wallet,
            method.network.platform,
            method.chainId,
          );
          break;
      }
      setIsDrawerOpen(false);
    },
    [
      onApplePaySelect,
      onCoinflowSelect,
      onCreditsSelect,
      clearSelectedWallet,
      onExternalConnect,
      isUS,
    ],
  );

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

  const purchaseKey = useMemo(
    () =>
      quote && creditsQuote
        ? [
            initialResolutionKey,
            quantity,
            quote.totalCost.toString(),
            creditsQuote.requiredCredits,
          ].join(":")
        : "",
    [initialResolutionKey, quantity, quote, creditsQuote],
  );
  const activePurchaseKeyRef = useRef("");
  useEffect(() => {
    activePurchaseKeyRef.current = purchaseKey;
    return () => {
      // Compare before clearing so StrictMode cleanup cannot invalidate a newer
      // fingerprint installed by a subsequent effect.
      if (activePurchaseKeyRef.current === purchaseKey) {
        activePurchaseKeyRef.current = "";
      }
    };
  }, [purchaseKey]);
  const autoCreditsPurchaseRef = useRef<string>();

  const purchaseInFlightRef = useRef(false);
  const continuePurchase = useCallback(async () => {
    if (purchaseInFlightRef.current) return;
    if (isApplePayAmountTooLow) return;

    // Explicit rails take precedence over the token-derived credits flag so
    // a lingering credits pseudo-token can never reroute a card/Apple Pay
    // purchase; the analytics method and the executed path stay in sync.
    const method = isCoinflowSelected
      ? "coinflow"
      : isApplePaySelected
        ? "apple-pay"
        : isCreditsSelected
          ? "credits"
          : "onchain";

    if (
      method === "coinflow" &&
      (!isUS || !isCoinflowEnabled || !isCoinflowStarterpackSupported)
    ) {
      return;
    }
    if (method === "credits" && !hasSufficientCredits) {
      if (!creditsQuote || !purchaseKey) return;
      const requiredCredits = BigInt(creditsQuote.requiredCredits);
      const shortfall =
        requiredCredits > creditsBalance
          ? requiredCredits - creditsBalance
          : 0n;
      // $1 = 1e8 raw credit units. Round upward to a cent so the top-up can
      // never land a fraction below the authoritative bundle quote.
      const shortfallUsd = Number((shortfall + 999_999n) / 1_000_000n) / 100;
      const topupAmount = Math.max(MIN_CREDITS_PURCHASE_USD, shortfallUsd);
      if (topupAmount > MAX_CREDITS_PURCHASE_USD) {
        setDisplayError(
          new Error(
            `The required credit top-up exceeds the $${MAX_CREDITS_PURCHASE_USD.toLocaleString()} card limit. Choose another payment method.`,
          ),
        );
        setIsDrawerOpen(true);
        return;
      }
      const originatingPurchaseKey = purchaseKey;

      initiateCreditsDeposit({
        preferredMethod: configuredCoinflowAvailable
          ? { type: "coinflow" }
          : undefined,
        minimumAmount: topupAmount,
        purchaseKey: originatingPurchaseKey,
        onSuccess: async () => {
          if (activePurchaseKeyRef.current !== originatingPurchaseKey) {
            throw new Error(
              "The bundle changed while credits were being added. Your credits are available for a new purchase.",
            );
          }
          if (autoCreditsPurchaseRef.current === originatingPurchaseKey) return;
          autoCreditsPurchaseRef.current = originatingPurchaseKey;

          try {
            await waitForCreditsBalance({
              requiredCredits,
              // On Sepolia, Controller-funded credits are immediately usable,
              // while Coinflow sandbox payments never grant spendable credits.
              // Read once so the former succeeds without polling the latter.
              timeoutMs: isCoinflowSandbox ? 0 : undefined,
              refetchBalance: async () => {
                if (activePurchaseKeyRef.current !== originatingPurchaseKey) {
                  throw new Error(
                    "The bundle changed while credits were being added. Your credits are available for a new purchase.",
                  );
                }
                return refetchCreditsBalance();
              },
            });
          } catch (error) {
            autoCreditsPurchaseRef.current = undefined;
            if (
              isCoinflowSandbox &&
              error instanceof CreditsBalancePendingError
            ) {
              throw new Error(
                "Sandbox card payments do not add spendable credits, so the bundle was not purchased.",
              );
            }
            throw error;
          }

          await onCreditsPurchase();
          navigate("/purchase/success", { reset: true });
        },
      });
      return;
    }
    if (method === "onchain" && !hasSufficientBalance && !isFree) {
      console.warn("no means to pay");
      return;
    }

    if (isBlocked) {
      setDisplayError(
        new Error(
          "This purchase is unavailable because you do not meet the game's age requirement.",
        ),
      );
      return;
    }

    if (!isAllowed) {
      setVerificationMethod("identity");
      return;
    }

    purchaseInFlightRef.current = true;

    captureAnalyticsEvent(posthog, "purchase_checkout_started", { method });

    setIsLoading(true);
    clearError();

    try {
      if (method === "credits") {
        await onCreditsPurchase();
        navigate("/purchase/success", { reset: true });
      } else if (method === "coinflow") {
        await onCreditCardPurchase();
        setIsCoinflowDrawerOpen(true);
      } else if (method === "apple-pay") {
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
    isCoinflowEnabled,
    isCoinflowStarterpackSupported,
    isUS,
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
    isCreditsSelected,
    hasSufficientCredits,
    initiateCreditsDeposit,
    refetchCreditsBalance,
    onCreditsPurchase,
    creditsQuote,
    creditsBalance,
    purchaseKey,
    configuredCoinflowAvailable,
    isCoinflowSandbox,
    setDisplayError,
    isAllowed,
    isBlocked,
  ]);

  const handlePurchase = useCallback(() => {
    runAfterLocationGate(continuePurchase);
  }, [runAfterLocationGate, continuePurchase]);

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

  if (
    isStarterpackLoading ||
    !quote ||
    !countryCodeLoaded ||
    (!isFree && !isInitialPaymentResolved)
  ) {
    return <LoadingState />;
  }

  if (locationGateView) {
    return locationGateView;
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

                {isCoinflowSelected && isCoinflowSandbox && (
                  <ErrorCard
                    variant="warning"
                    title="Coinflow Sandbox Enabled"
                    message="Card checkout will run in Coinflow's sandbox environment. No real charge will be made."
                  />
                )}

                {isCoinflowSelected && !isCoinflowStarterpackSupported && (
                  <ErrorCard
                    variant="error"
                    title="Credit Card Checkout Unavailable"
                    message="Credit card checkout is only available for starterpacks priced in USDC."
                  />
                )}

                {isCreditsSelected && creditsQuoteError && (
                  <ErrorCard
                    variant="error"
                    title="Credits Checkout Unavailable"
                    message={
                      advancedView
                        ? creditsQuoteError.message
                        : "Credits checkout could not be prepared. Please try again."
                    }
                  />
                )}

                {showInsufficientCredits && (
                  <ErrorCard
                    variant="warning"
                    title={
                      showConfiguredCreditsTopup
                        ? "Insufficient Balance"
                        : "Insufficient Credits"
                    }
                    message={
                      showConfiguredCreditsTopup
                        ? "You need to deposit funds to complete this purchase."
                        : "You need more credits to complete this purchase."
                    }
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

                {!showConfiguredCreditsTopup && (
                  <WalletSelector
                    method={selectedMethod}
                    bridgeFrom={bridgeFrom}
                    onClick={handleWalletSelect}
                  />
                )}

                <OnchainCostBreakdown quote={quote} />

                <QuantityControls
                  quantity={quantity}
                  isLoading={
                    isLoading ||
                    isCheckingFallback ||
                    (bridgeFrom !== null && isFetchingFees) ||
                    isCreatingOrder ||
                    isCoinflowLoading ||
                    (isCreditsSelected &&
                      (isCreditsQuoteLoading || isCreditsLoading)) ||
                    applePayLimitsLoading
                  }
                  isSendingDeposit={isSendingDeposit}
                  globalDisabled={globalDisabled}
                  hasSufficientBalance={
                    isCreditsSelected
                      ? hasSufficientCredits
                      : hasSufficientBalance ||
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
                        : showInsufficientCredits
                          ? "Deposit USD"
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
        setSelected={handlePaymentMethodSelect}
        showFiatOptions={isUS}
        enableCoinflow={configuredCard}
        showCredits={false} // credits available from controller
        showController={true}
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
          // Verification is part of the purchase attempt that already passed
          // its fresh location check, so continue without starting a new one.
          setVerificationMethod(null);
          void continuePurchase();
        }}
      />
    </>
  );
}
