import { useState, useEffect } from "react";
import { num } from "starknet";
import type { ExternalPlatform, ExternalWallet } from "@cartridge/controller";
import { fetchSwapQuote, isQuoteChain } from "@/utils/ekubo";
import { isOnchainStarterpack } from "@/context/starterpack/types";
import type { OnchainStarterpackDetails } from "@/context/starterpack/types";
import type { TokenOption } from "./token-selection";
import { fetchErc20Balance, isUsdcVariantPair } from "./token-fallback";
import Controller from "@/utils/controller";

export interface UseTokenSufficiencyOptions {
  controller: Controller | undefined;
  starterpackDetails: OnchainStarterpackDetails | undefined;
  availableTokens: TokenOption[];
  quantity: number;
  selectedWallet: ExternalWallet | undefined;
  walletAddress: string | undefined;
  selectedPlatform: ExternalPlatform | undefined;
}

export interface UseTokenSufficiencyReturn {
  /**
   * Hex-normalized addresses of tokens whose balance cannot cover the
   * purchase. Tokens still being checked (or whose balance/quote could not be
   * resolved) are NOT included — the selector only disables tokens that are
   * confirmed unpayable.
   */
  insufficientTokens: Set<string>;
  isCheckingSufficiency: boolean;
}

/**
 * Checks, for every selectable payment token, whether the paying wallet holds
 * enough of it to cover the purchase — so the token selector can disable the
 * ones that would only dead-end in an "insufficient balance" auto-switch.
 * The credits/USD pseudo-token is never checked: it is a payment-method
 * choice and stays selectable so users can top up.
 */
export function useTokenSufficiency({
  controller,
  starterpackDetails,
  availableTokens,
  quantity,
  selectedWallet,
  walletAddress,
  selectedPlatform,
}: UseTokenSufficiencyOptions): UseTokenSufficiencyReturn {
  const [insufficientTokens, setInsufficientTokens] = useState<Set<string>>(
    new Set(),
  );
  const [isCheckingSufficiency, setIsCheckingSufficiency] = useState(false);

  useEffect(() => {
    const quote =
      starterpackDetails && isOnchainStarterpack(starterpackDetails)
        ? starterpackDetails.quote
        : undefined;

    // Bridging flows lock the token to USDC and pay from another chain, so
    // Starknet balances are irrelevant there.
    const isBridging = !!selectedPlatform && selectedPlatform !== "starknet";

    // Mirror useTokenBalance: external Starknet wallets pay from their own
    // address, everything else pays from the controller.
    const isExternalStarknetWallet =
      selectedWallet?.type === "argent" || selectedWallet?.type === "braavos";
    const ownerAddress =
      isExternalStarknetWallet && walletAddress
        ? walletAddress
        : controller?.address();

    if (
      !controller ||
      !quote ||
      quote.totalCost === 0n ||
      isBridging ||
      !ownerAddress ||
      availableTokens.length === 0
    ) {
      setInsufficientTokens(new Set());
      setIsCheckingSufficiency(false);
      return;
    }

    const abortController = new AbortController();
    const chainId = controller.chainId();
    const totalCost = quote.totalCost * BigInt(quantity);
    const candidates = availableTokens.filter((token) => !token.isCredits);

    const checkAll = async () => {
      setIsCheckingSufficiency(true);
      setInsufficientTokens(new Set());

      const results = await Promise.all(
        candidates.map(async (candidate) => {
          try {
            const isPaymentToken =
              num.toHex(candidate.address) === num.toHex(quote.paymentToken);

            let requiredAmount: bigint;
            if (
              isPaymentToken ||
              isUsdcVariantPair(candidate.address, quote.paymentToken, chainId)
            ) {
              requiredAmount = totalCost;
            } else if (!isQuoteChain(chainId)) {
              // No swap/price source: the token can't be priced, so don't
              // claim insufficiency.
              return null;
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

            if (abortController.signal.aborted) return null;

            const balance = await fetchErc20Balance(
              controller,
              candidate.address,
              ownerAddress,
            );

            if (balance !== null && balance < requiredAmount) {
              return num.toHex(candidate.address);
            }
            return null;
          } catch (error) {
            if (!abortController.signal.aborted) {
              console.warn(
                `Sufficiency check failed for ${candidate.symbol}:`,
                error,
              );
            }
            // Unknown ≠ insufficient: leave the token selectable.
            return null;
          }
        }),
      );

      if (abortController.signal.aborted) return;
      setInsufficientTokens(
        new Set(results.filter((address): address is string => !!address)),
      );
      setIsCheckingSufficiency(false);
    };

    checkAll();

    return () => {
      abortController.abort();
    };
  }, [
    controller,
    starterpackDetails,
    availableTokens,
    quantity,
    selectedWallet,
    walletAddress,
    selectedPlatform,
  ]);

  return { insufficientTokens, isCheckingSufficiency };
}
