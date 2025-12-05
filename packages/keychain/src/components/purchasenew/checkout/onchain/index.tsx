import {
  useNavigation,
  useStarterpackContext,
  useOnchainPurchaseContext,
} from "@/context";
import {
  Button,
  GiftIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  ErrorAlertIcon,
  Card,
  CardContent,
  ListIcon,
  PlusIcon,
  MinusIcon,
} from "@cartridge/ui";
import { Receiving } from "../../receiving";
import { OnchainCostBreakdown } from "../../review/cost";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ControllerErrorAlert } from "@/components/ErrorAlert";
import { useConnection } from "@/hooks/connection";
import { isOnchainStarterpack } from "@/context";
import { num, uint256 } from "starknet";
import { getWallet } from "../../wallet/config";
import { LoadingState } from "../../loading";
import { humanizeString } from "@cartridge/controller";

export function OnchainCheckout() {
  const { isStarterpackLoading, starterpackDetails, displayError, clearError } =
    useStarterpackContext();
  const {
    isFetchingConversion,
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
  } = useOnchainPurchaseContext();
  const { navigate } = useNavigation();
  const { controller } = useConnection();
  const [isChecking, setIsChecking] = useState(true);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [bridgeFrom, setBridgeFrom] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const wallet = getWallet(selectedWallet?.type || "controller");

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

  // Determine if we're still loading balance data
  const isLoadingBalance = useMemo(() => {
    // If there's a balance error, stop showing loading state
    if (balanceError) return false;

    return isChecking || balance === null || tokenToCheck === null;
  }, [isChecking, balance, tokenToCheck, balanceError]);

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

    if (tokenToCheck.needsConversion) {
      return balance >= tokenToCheck.requiredAmount;
    }

    return balance >= tokenToCheck.requiredAmount * BigInt(quantity);
  }, [balance, tokenToCheck, isLoadingBalance, quantity]);

  // Check if we need token conversion (selected token differs from payment token)
  const needsConversion = useMemo(() => {
    if (!quote || !selectedToken) return false;
    return num.toHex(selectedToken.address) !== num.toHex(quote.paymentToken);
  }, [quote, selectedToken]);

  const isFree = useMemo(() => {
    return quote?.totalCost === BigInt(0);
  }, [quote]);

  const onPurchase = useCallback(async () => {
    if (!hasSufficientBalance && !isFree) return;

    setIsLoading(true);
    clearError();
    try {
      await onOnchainPurchase();
      navigate("/purchase/pending", { reset: true });
    } catch (error) {
      console.error("Purchase failed:", error);
      // Error will be displayed via displayError in the UI
    } finally {
      setIsLoading(false);
    }
  }, [hasSufficientBalance, isFree, onOnchainPurchase, navigate, clearError]);

  // Fetch user's token balance
  useEffect(() => {
    if (selectedPlatform && selectedPlatform !== "starknet") {
      setBridgeFrom(`(${humanizeString(selectedPlatform)})`);
      return;
    }

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
          return;
        } catch (error) {
          lastError = error;
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          // If it's an EntrypointNotFound error, try the next entrypoint
          if (errorMessage.includes("EntrypointNotFound")) {
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
  }, [
    controller,
    tokenToCheck,
    selectedWallet,
    walletAddress,
    selectedPlatform,
  ]);

  const onWalletSelect = () => {
    const methods = "starknet;ethereum;base;arbitrum;optimism";
    navigate(`/purchase/network/${methods}`);
  };

  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  if (isStarterpackLoading || !quote) {
    return <LoadingState />;
  }

  const tokenSymbol = tokenToCheck?.symbol ?? quote.paymentTokenMetadata.symbol;

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
        {!isFree ? (
          <>
            {balanceError && (
              <Card className="border-error">
                <CardContent className="flex flex-row items-center gap-3 p-3 text-error">
                  <ErrorAlertIcon variant="error" size="sm" />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold">
                      Balance Check Failed
                    </p>
                    <p className="text-xs text-foreground-300">
                      {balanceError}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            {!isLoadingBalance && !hasSufficientBalance && !balanceError && (
              <Card className="border-warning">
                <CardContent className="flex flex-row items-center gap-3 p-3 text-warning">
                  <ErrorAlertIcon variant="warning" size="sm" />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold">
                      Insufficient Balance
                    </p>
                    <p className="text-xs text-foreground-300">
                      You need more {tokenSymbol} to complete this purchase.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            {conversionError && needsConversion && (
              <Card className="border-error">
                <CardContent className="flex flex-row items-center gap-3 p-3 text-error">
                  <ErrorAlertIcon variant="error" size="sm" />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold">
                      Insufficient Liquidity
                    </p>
                    <p className="text-xs text-foreground-300">
                      Unable to swap to {selectedToken?.symbol}. Try selecting a
                      different token.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            <div
              className={`flex justify-between border border-background-200 bg-[#181C19] rounded-[4px] text-xs text-foreground-300 p-2 transition-colors cursor-pointer hover:bg-background-200`}
              onClick={onWalletSelect}
            >
              <div className="flex gap-2">
                {wallet.subIcon} Purchase with {wallet.name} {bridgeFrom}
              </div>
              <ListIcon size="xs" variant="solid" />
            </div>

            <OnchainCostBreakdown quote={quote} />

            <div className="flex flex-row gap-3">
              <Button
                variant="secondary"
                onClick={decrementQuantity}
                disabled={
                  quantity <= 1 ||
                  isLoadingBalance ||
                  !!balanceError ||
                  isFetchingConversion
                }
              >
                <MinusIcon size="xs" />
              </Button>
              <Button
                variant="secondary"
                onClick={incrementQuantity}
                disabled={
                  isLoadingBalance || !!balanceError || isFetchingConversion
                }
              >
                <PlusIcon size="xs" variant="solid" />
              </Button>
              <Button
                className="w-full"
                isLoading={isLoading}
                disabled={
                  !hasSufficientBalance ||
                  isLoadingBalance ||
                  !!balanceError ||
                  isFetchingConversion
                }
                onClick={onPurchase}
              >
                Buy {quantity}
              </Button>
            </div>
          </>
        ) : (
          <Button className="w-full" isLoading={isLoading} onClick={onPurchase}>
            Claim
          </Button>
        )}
      </LayoutFooter>
    </>
  );
}
