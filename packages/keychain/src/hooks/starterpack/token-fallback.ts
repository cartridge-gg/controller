import { useState, useEffect, useRef } from "react";
import { num, uint256 } from "starknet";
import { fetchSwapQuote, USDC_ADDRESSES } from "@/utils/ekubo";
import { isOnchainStarterpack } from "@/context/starterpack/types";
import type { OnchainStarterpackDetails } from "@/context/starterpack/types";
import type { TokenOption } from "./token-selection";
import type { ExternalPlatform } from "@cartridge/controller";
import Controller from "@/utils/controller";

export interface UseTokenFallbackOptions {
  controller: Controller | undefined;
  starterpackDetails: OnchainStarterpackDetails | undefined;
  availableTokens: TokenOption[];
  selectedToken: TokenOption | undefined;
  hasSufficientBalance: boolean;
  isLoadingBalance: boolean;
  balanceError: string | null;
  quantity: number;
  isStripeSelected: boolean;
  isApplePaySelected: boolean;
  selectedPlatform: ExternalPlatform | undefined;
  setSelectedToken: (token: TokenOption) => void;
  onStripeSelect: () => void;
}

export interface UseTokenFallbackReturn {
  isCheckingFallback: boolean;
}

async function fetchBalance(
  controller: Controller,
  tokenAddress: string,
  ownerAddress: string,
): Promise<bigint | null> {
  const entrypoints = ["balance_of", "balanceOf"];

  for (const entrypoint of entrypoints) {
    try {
      const result = await controller.provider.callContract({
        contractAddress: tokenAddress,
        entrypoint,
        calldata: [ownerAddress],
      });

      return uint256.uint256ToBN({
        low: result[0],
        high: result[1],
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("EntrypointNotFound")) {
        continue;
      }
      break;
    }
  }

  return null;
}

/**
 * Hook that checks fallback token balances when the selected token has
 * insufficient funds. If a token with sufficient balance is found, it
 * auto-switches to it. If none are found and the starterpack is priced
 * in USDC, it defaults to Stripe checkout.
 */
export function useTokenFallback({
  controller,
  starterpackDetails,
  availableTokens,
  selectedToken,
  hasSufficientBalance,
  isLoadingBalance,
  balanceError,
  quantity,
  isStripeSelected,
  isApplePaySelected,
  selectedPlatform,
  setSelectedToken,
  onStripeSelect,
}: UseTokenFallbackOptions): UseTokenFallbackReturn {
  const [isCheckingFallback, setIsCheckingFallback] = useState(false);
  const hasAttemptedFallback = useRef(false);

  useEffect(() => {
    if (
      isLoadingBalance ||
      hasSufficientBalance ||
      !!balanceError ||
      hasAttemptedFallback.current ||
      !controller ||
      !starterpackDetails ||
      !isOnchainStarterpack(starterpackDetails) ||
      !selectedToken ||
      isStripeSelected ||
      isApplePaySelected ||
      (selectedPlatform && selectedPlatform !== "starknet")
    ) {
      return;
    }

    const quote = starterpackDetails.quote;
    if (!quote || quote.totalCost === 0n) return;

    hasAttemptedFallback.current = true;

    const abortController = new AbortController();

    const checkFallbacks = async () => {
      setIsCheckingFallback(true);

      const candidates = availableTokens.filter(
        (token) => token.address !== selectedToken.address,
      );

      const ownerAddress = controller.address();
      const totalCost = quote.totalCost * BigInt(quantity);

      for (const candidate of candidates) {
        if (abortController.signal.aborted) return;

        try {
          const isPaymentToken =
            num.toHex(candidate.address) === num.toHex(quote.paymentToken);

          let requiredAmount: bigint;

          if (isPaymentToken) {
            requiredAmount = totalCost;
          } else {
            const swapResult = await fetchSwapQuote(
              totalCost,
              quote.paymentToken,
              candidate.address,
              controller.chainId(),
              abortController.signal,
            );
            requiredAmount = swapResult.total;
          }

          if (abortController.signal.aborted) return;

          const balance = await fetchBalance(
            controller,
            candidate.address,
            ownerAddress,
          );

          if (abortController.signal.aborted) return;

          if (balance !== null && balance >= requiredAmount) {
            setSelectedToken(candidate);
            setIsCheckingFallback(false);
            return;
          }
        } catch (error) {
          console.warn(`Fallback check failed for ${candidate.symbol}:`, error);
          continue;
        }
      }

      if (abortController.signal.aborted) return;

      // No fallback token found - default to Stripe if priced in USDC
      const usdcAddress = USDC_ADDRESSES[controller.chainId()];
      if (
        usdcAddress &&
        num.toHex(quote.paymentToken) === num.toHex(usdcAddress)
      ) {
        onStripeSelect();
      }

      setIsCheckingFallback(false);
    };

    checkFallbacks();

    return () => {
      abortController.abort();
    };
  }, [
    controller,
    starterpackDetails,
    availableTokens,
    selectedToken,
    hasSufficientBalance,
    isLoadingBalance,
    balanceError,
    quantity,
    isStripeSelected,
    isApplePaySelected,
    selectedPlatform,
    setSelectedToken,
    onStripeSelect,
  ]);

  return { isCheckingFallback };
}
