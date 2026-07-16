import { useState, useEffect, useRef } from "react";
import { num, uint256 } from "starknet";
import {
  fetchSwapQuote,
  USDC_ADDRESSES,
  USDCE_ADDRESSES,
  isQuoteChain,
} from "@/utils/ekubo";
import { isOnchainStarterpack } from "@/context/starterpack/types";
import type { OnchainStarterpackDetails } from "@/context/starterpack/types";
import type { TokenOption } from "./token-selection";
import type { ExternalPlatform } from "@cartridge/controller";
import Controller from "@/utils/controller";

/**
 * USDC and USDC.e are 1:1 pegged stablecoins with the same decimals, so swap
 * quotes between them are wasted Ekubo requests. Treat the pair as equivalent
 * when estimating how much of a fallback candidate the user would need.
 */
function isUsdcVariantPair(a: string, b: string, chainId: string): boolean {
  const usdc = USDC_ADDRESSES[chainId];
  const usdce = USDCE_ADDRESSES[chainId];
  if (!usdc || !usdce) return false;
  const variants = new Set([num.toHex(usdc), num.toHex(usdce)]);
  return variants.has(num.toHex(a)) && variants.has(num.toHex(b));
}

export interface UseTokenFallbackOptions {
  controller: Controller | undefined;
  starterpackDetails: OnchainStarterpackDetails | undefined;
  availableTokens: TokenOption[];
  selectedToken: TokenOption | undefined;
  hasSufficientBalance: boolean;
  isLoadingBalance: boolean;
  balanceError: string | null;
  quantity: number;
  isCoinflowSelected: boolean;
  isApplePaySelected: boolean;
  isCreditsSelected: boolean;
  selectedPlatform: ExternalPlatform | undefined;
  setSelectedToken: (token: TokenOption) => void;
}

export interface UseTokenFallbackReturn {
  isCheckingFallback: boolean;
  status: "pending" | "funded" | "exhausted" | "indeterminate";
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
 * auto-switches to it; otherwise the caller's "insufficient balance" UI
 * takes over.
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
  isCoinflowSelected,
  isApplePaySelected,
  isCreditsSelected,
  selectedPlatform,
  setSelectedToken,
}: UseTokenFallbackOptions): UseTokenFallbackReturn {
  const [isCheckingFallback, setIsCheckingFallback] = useState(false);
  const [status, setStatus] =
    useState<UseTokenFallbackReturn["status"]>("pending");
  const generationRef = useRef(0);
  const scanKeyRef = useRef<string>();
  const foundTokenRef = useRef<string>();

  useEffect(() => {
    const quote =
      starterpackDetails && isOnchainStarterpack(starterpackDetails)
        ? starterpackDetails.quote
        : undefined;
    const scanKey =
      controller && quote
        ? [
            controller.address(),
            controller.chainId(),
            quote.paymentToken,
            quote.totalCost.toString(),
            quantity.toString(),
            selectedPlatform ?? "starknet",
          ].join(":")
        : undefined;

    if (scanKeyRef.current !== scanKey) {
      generationRef.current += 1;
      scanKeyRef.current = scanKey;
      foundTokenRef.current = undefined;
      setStatus("pending");
    }

    if (isCoinflowSelected || isApplePaySelected || isCreditsSelected) {
      setIsCheckingFallback(false);
      return;
    }

    if (
      isLoadingBalance ||
      !controller ||
      !starterpackDetails ||
      !isOnchainStarterpack(starterpackDetails) ||
      !selectedToken ||
      !quote ||
      !scanKey
    ) {
      setStatus("pending");
      return;
    }

    if (quote.totalCost === 0n || hasSufficientBalance) {
      setIsCheckingFallback(false);
      setStatus("funded");
      return;
    }

    if (balanceError) {
      setIsCheckingFallback(false);
      setStatus("indeterminate");
      return;
    }

    if (selectedPlatform && selectedPlatform !== "starknet") {
      setIsCheckingFallback(false);
      setStatus("exhausted");
      return;
    }

    if (
      foundTokenRef.current &&
      num.toHex(foundTokenRef.current) === num.toHex(selectedToken.address)
    ) {
      setStatus("funded");
      return;
    }

    const abortController = new AbortController();
    const generation = ++generationRef.current;

    const checkFallbacks = async () => {
      setIsCheckingFallback(true);
      setStatus("pending");
      let indeterminate = false;
      try {
        const candidates = availableTokens.filter(
          (token) =>
            !token.isCredits &&
            num.toHex(token.address) !== num.toHex(selectedToken.address),
        );

        const ownerAddress = controller.address();
        const chainId = controller.chainId();
        const totalCost = quote.totalCost * BigInt(quantity);

        for (const candidate of candidates) {
          if (abortController.signal.aborted) return;

          try {
            const isPaymentToken =
              num.toHex(candidate.address) === num.toHex(quote.paymentToken);

            let requiredAmount: bigint;

            if (
              isPaymentToken ||
              isUsdcVariantPair(candidate.address, quote.paymentToken, chainId)
            ) {
              // Same token or USDC ↔ USDC.e (1:1 pegged); no Ekubo quote needed.
              requiredAmount = totalCost;
            } else if (!isQuoteChain(chainId)) {
              // No swap/price source on this chain (e.g. Katana): a non-payment
              // candidate can't be priced or swapped to, so it can't be a
              // fallback. Skip it rather than calling Ekubo.
              continue;
            } else {
              const swapResult = await fetchSwapQuote(
                totalCost,
                quote.paymentToken,
                candidate.address,
                chainId,
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
              if (generation !== generationRef.current) return;
              foundTokenRef.current = candidate.address;
              setSelectedToken(candidate);
              setStatus("funded");
              return;
            }
            if (balance === null) indeterminate = true;
          } catch (error) {
            console.warn(
              `Fallback check failed for ${candidate.symbol}:`,
              error,
            );
            indeterminate = true;
            continue;
          }
        }
        if (
          !abortController.signal.aborted &&
          generation === generationRef.current
        ) {
          setStatus(indeterminate ? "indeterminate" : "exhausted");
        }
      } finally {
        // Always clear the loading flag, even on abort / early return, so the
        // Buy button doesn't stick in a spinning state.
        if (generation === generationRef.current) {
          setIsCheckingFallback(false);
        }
      }
    };

    checkFallbacks();

    return () => {
      abortController.abort();
      if (generationRef.current === generation) {
        generationRef.current += 1;
      }
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
    isCoinflowSelected,
    isApplePaySelected,
    isCreditsSelected,
    selectedPlatform,
    setSelectedToken,
  ]);

  return { isCheckingFallback, status };
}
