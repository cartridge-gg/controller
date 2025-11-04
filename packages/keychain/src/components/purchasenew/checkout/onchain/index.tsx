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
import { num, uint256 } from "starknet";

export function OnchainCheckout() {
  const {
    purchaseItems,
    displayError,
    starterpackDetails,
    selectedWallet,
    walletAddress,
    onOnchainPurchase,
    clearError,
    selectedToken,
    convertedPrice,
    isFetchingConversion,
    conversionError,
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

  // Determine which token to check balance for and required amount
  const tokenToCheck = useMemo(() => {
    if (!quote) return null;
    
    // If a token is selected and it's different from payment token, check selected token
    if (
      selectedToken &&
      num.toHex(selectedToken.address)  !== num.toHex(quote.paymentToken)
    ) {
      return {
        address: selectedToken.address,
        symbol: selectedToken.symbol,
        requiredAmount: convertedPrice?.amount ?? null,
        needsConversion: true,
      };
    }
    // Otherwise check payment token (no conversion needed)
    return {
      address: quote.paymentToken,
      symbol: quote.paymentTokenMetadata.symbol,
      requiredAmount: quote.totalCost,
      needsConversion: false,
    };
  }, [quote, selectedToken, convertedPrice]);

  // Determine if we're still loading balance/conversion data
  const isLoadingBalance = useMemo(() => {
    // If there's a conversion error and we need conversion, stop showing loading state
    if (conversionError && tokenToCheck?.needsConversion) return false;
    
    return (
      isChecking ||
      (isFetchingConversion && tokenToCheck?.needsConversion) ||
      balance === null ||
      tokenToCheck === null ||
      tokenToCheck.requiredAmount === null
    );
  }, [isChecking, isFetchingConversion, balance, tokenToCheck, conversionError]);

  // Check if user has sufficient balance (only when not loading)
  const hasSufficientBalance = useMemo(() => {
    if (isLoadingBalance) return false; // Don't show insufficient balance while loading
    if (
      !tokenToCheck ||
      balance === null ||
      tokenToCheck.requiredAmount === null
    ) {
      return false;
    }
    return balance >= tokenToCheck.requiredAmount;
  }, [balance, tokenToCheck, isLoadingBalance]);

  // Fetch user's token balance
  useEffect(() => {
    // Reset balance when wallet selection or token selection changes
    setBalance(null);
    setIsChecking(true);

    const checkBalance = async () => {
      if (!controller || !tokenToCheck) {
        setIsChecking(false);
        return;
      }

      // Use external wallet address for Argent/Braavos, otherwise use controller address
      const isExternalStarknetWallet =
        selectedWallet?.type === "argent" || selectedWallet?.type === "braavos";
      const addressToCheck =
        isExternalStarknetWallet && walletAddress
          ? walletAddress
          : controller.address();

      try {
        // Call balanceOf on the token contract (selected token or payment token)
        const result = await controller.provider.callContract({
          contractAddress: tokenToCheck.address,
          entrypoint: "balanceOf",
          calldata: [addressToCheck],
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
  }, [controller, tokenToCheck, selectedWallet, walletAddress]);

  const onPurchase = useCallback(async () => {
    if (!hasSufficientBalance) return;

    setIsLoading(true);
    try {
      await onOnchainPurchase();
      navigate("/purchase/pending", { reset: true });
    } catch (error) {
      console.error("Purchase failed:", error);
      // Error will be displayed via displayError in the UI
    } finally {
      setIsLoading(false);
    }
  }, [hasSufficientBalance, onOnchainPurchase, navigate]);

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

  const tokenSymbol = tokenToCheck?.symbol ?? quote.paymentTokenMetadata.symbol;

  return (
    <>
      <HeaderInner
        title="Review Purchase"
        icon={<GiftIcon variant="solid" />}
      />
      <LayoutContent>
        <Receiving title="Receiving" items={purchaseItems} />
      </LayoutContent>
      <LayoutFooter>
        {/* Insufficient Balance Warning */}
        {!isLoadingBalance &&
          !hasSufficientBalance &&
          !(conversionError && tokenToCheck?.needsConversion) && (
            <Card className="border-warning">
              <CardContent className="flex flex-row items-center gap-3 p-3 text-warning">
                <ErrorAlertIcon variant="warning" size="sm" />
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold">Insufficient Balance</p>
                  <p className="text-xs text-foreground-300">
                    You need more {tokenSymbol} to complete this purchase.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Conversion Error Warning - only show if we actually need conversion */}
        {conversionError && tokenToCheck?.needsConversion && (
          <Card className="border-warning">
            <CardContent className="flex flex-row items-center gap-3 p-3 text-warning">
              <ErrorAlertIcon variant="warning" size="sm" />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold">Insufficient Liquidity</p>
                <p className="text-xs text-foreground-300">
                  Unable to convert to {tokenSymbol}. Try selecting a different
                  token or contact support.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <OnchainCostBreakdown quote={quote} showTokenSelector />
        {displayError && <ControllerErrorAlert error={displayError} />}
        <Button
          onClick={onPurchase}
          isLoading={isLoading || isLoadingBalance}
          disabled={
            !hasSufficientBalance ||
            isLoadingBalance ||
            (!!conversionError && tokenToCheck?.needsConversion)
          }
        >
          {conversionError && tokenToCheck?.needsConversion
            ? "Insufficient Liquidity"
            : !hasSufficientBalance && !isLoadingBalance
              ? "Insufficient Balance"
              : "Confirm"}
        </Button>
      </LayoutFooter>
    </>
  );
}
