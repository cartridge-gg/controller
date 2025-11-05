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
  const [balanceError, setBalanceError] = useState<string | null>(null);
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
      num.toHex(selectedToken.address) !== num.toHex(quote.paymentToken)
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
  }, [
    isChecking,
    isFetchingConversion,
    balance,
    tokenToCheck,
    conversionError,
  ]);

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
    setBalanceError(null);
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

      // Try balance_of first (snake_case), then balanceOf (camelCase)
      const entrypoints = ["balance_of", "balanceOf"];
      let lastError: Error | unknown = null;

      for (const entrypoint of entrypoints) {
        try {
          const result = await controller.provider.callContract({
            contractAddress: tokenToCheck.address,
            entrypoint,
            calldata: [addressToCheck],
          });

          // Parse the u256 balance (2 felts: low, high)
          const balanceBN = uint256.uint256ToBN({
            low: result[0],
            high: result[1],
          });

          setBalance(balanceBN);
          setBalanceError(null);
          setIsChecking(false);
          return; // Success, exit early
        } catch (error) {
          lastError = error;
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          // If it's an EntrypointNotFound error, try the next entrypoint
          if (
            errorMessage.includes("EntrypointNotFound") ||
            errorMessage.includes("Entry point") ||
            errorMessage.includes("not found")
          ) {
            console.log(`Entrypoint '${entrypoint}' not found, trying next...`);
            continue;
          }

          // If it's a different error, break the loop
          break;
        }
      }

      // If we get here, all entrypoints failed
      console.error(
        "Failed to fetch token balance with all entrypoints:",
        lastError,
      );
      setBalanceError("Unable to retrieve balance from token contract");
      setBalance(null);
      setIsChecking(false);
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
        {/* Balance Retrieval Error */}
        {balanceError && (
          <Card className="border-error">
            <CardContent className="flex flex-row items-center gap-3 p-3 text-error">
              <ErrorAlertIcon variant="error" size="sm" />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold">Balance Check Failed</p>
                <p className="text-xs text-foreground-300">{balanceError}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Insufficient Balance Warning */}
        {!isLoadingBalance &&
          !hasSufficientBalance &&
          !balanceError &&
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
          <Card className="border-error">
            <CardContent className="flex flex-row items-center gap-3 p-3 text-error">
              <ErrorAlertIcon variant="error" size="sm" />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold">Insufficient Liquidity</p>
                <p className="text-xs text-foreground-300">
                  Unable to convert to {tokenSymbol}. Try selecting a different
                  token.
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
            !!balanceError ||
            (!!conversionError && tokenToCheck?.needsConversion)
          }
        >
          {balanceError
            ? "Balance Check Failed"
            : conversionError && tokenToCheck?.needsConversion
              ? "Insufficient Liquidity"
              : !hasSufficientBalance && !isLoadingBalance
                ? "Insufficient Balance"
                : "Confirm"}
        </Button>
      </LayoutFooter>
    </>
  );
}
