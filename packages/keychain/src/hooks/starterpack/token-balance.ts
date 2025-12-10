import { useState, useEffect, useMemo, useCallback } from "react";
import { num, uint256 } from "starknet";
import { humanizeString, ExternalPlatform } from "@cartridge/controller";
import { isOnchainStarterpack } from "@/context/starterpack/types";
import type { OnchainStarterpackDetails } from "@/context/starterpack/types";
import type { TokenOption } from "./token-selection";
import Controller from "@/utils/controller";

export interface WalletInfo {
  type: string;
  address?: string;
}

export interface ConvertedPriceInfo {
  amount: bigint;
  tokenMetadata: { symbol: string; decimals: number };
}

export interface UseTokenBalanceOptions {
  controller: Controller | undefined;
  starterpackDetails: OnchainStarterpackDetails | undefined;
  selectedToken: TokenOption | undefined;
  convertedPrice: ConvertedPriceInfo | null;
  selectedWallet: WalletInfo | undefined;
  walletAddress: string | undefined;
  selectedPlatform: ExternalPlatform | undefined;
  quantity: number;
}

export interface UseTokenBalanceReturn {
  balance: bigint | null;
  isChecking: boolean;
  balanceError: string | null;
  bridgeFrom: string | null;
  hasSufficientBalance: boolean;
  isLoadingBalance: boolean;
  needsConversion: boolean;
  tokenSymbol: string;
}

/**
 * Hook for checking token balance and determining if user has sufficient funds
 */
export function useTokenBalance({
  controller,
  starterpackDetails,
  selectedToken,
  convertedPrice,
  selectedWallet,
  walletAddress,
  selectedPlatform,
  quantity,
}: UseTokenBalanceOptions): UseTokenBalanceReturn {
  const [balance, setBalance] = useState<bigint | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [bridgeFrom, setBridgeFrom] = useState<string | null>(null);

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

  // Check if we need token conversion (selected token differs from payment token)
  const needsConversion = useMemo(() => {
    if (!quote || !selectedToken) return false;
    return num.toHex(selectedToken.address) !== num.toHex(quote.paymentToken);
  }, [quote, selectedToken]);

  // Determine if we're still loading balance data
  const isLoadingBalance = useMemo(() => {
    if (balanceError) return false;
    return isChecking || balance === null || tokenToCheck === null;
  }, [isChecking, balance, tokenToCheck, balanceError]);

  // Check if user has sufficient balance (only when not loading)
  const hasSufficientBalance = useMemo(() => {
    if (isLoadingBalance) return false;
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

  // Token symbol for display
  const tokenSymbol = useMemo(() => {
    return tokenToCheck?.symbol ?? quote?.paymentTokenMetadata.symbol ?? "";
  }, [tokenToCheck, quote]);

  // Fetch balance from token contract
  const fetchBalance = useCallback(async () => {
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
  }, [controller, tokenToCheck, selectedWallet, walletAddress]);

  // Effect to fetch balance when dependencies change
  useEffect(() => {
    // Handle non-Starknet platforms (bridging)
    if (selectedPlatform && selectedPlatform !== "starknet") {
      setBridgeFrom(`${humanizeString(selectedPlatform)}`);
      return;
    }

    // Reset state when wallet/token selection changes
    setBridgeFrom(null);
    setBalance(null);
    setBalanceError(null);
    setIsChecking(true);

    fetchBalance();
  }, [
    controller,
    tokenToCheck,
    selectedWallet,
    walletAddress,
    selectedPlatform,
    fetchBalance,
  ]);

  return {
    balance,
    isChecking,
    balanceError,
    bridgeFrom,
    hasSufficientBalance,
    isLoadingBalance,
    needsConversion,
    tokenSymbol,
  };
}
