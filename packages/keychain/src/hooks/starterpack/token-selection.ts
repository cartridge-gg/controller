import { useState, useCallback, useEffect, useMemo } from "react";
import { erc20Metadata, ExternalPlatform } from "@cartridge/controller";
import { num, getChecksumAddress, constants } from "starknet";
import { ERC20 as ERC20Contract } from "@cartridge/ui/utils";
import {
  DEFAULT_TOKENS,
  type ERC20Metadata,
} from "@/components/provider/tokens";
import { fetchSwapQuote, USDC_ADDRESSES, type SwapQuote } from "@/utils/ekubo";
import {
  fetchTokenMetadata,
  type TokenMetadata as FullTokenMetadata,
} from "@/utils/token-metadata";
import makeBlockie from "ethereum-blockies-base64";
import {
  isOnchainStarterpack,
  type OnchainStarterpackDetails,
} from "@/context/starterpack/types";
import Controller from "@/utils/controller";

export interface TokenOption {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  icon: string;
  contract: ERC20Contract;
}

// Minimal token metadata for price display
interface PriceTokenMetadata {
  symbol: string;
  decimals: number;
}

export interface ConvertedPrice {
  amount: bigint;
  quantity: number;
  tokenMetadata: PriceTokenMetadata;
}

export interface UseTokenSelectionOptions {
  controller: Controller | undefined;
  starterpackDetails: OnchainStarterpackDetails | undefined;
  quantity: number;
  selectedPlatform: ExternalPlatform | undefined;
}

export interface UseTokenSelectionReturn {
  // Token list
  availableTokens: TokenOption[];

  // Selection
  selectedToken: TokenOption | undefined;
  setSelectedToken: (token: TokenOption | undefined) => void;

  // Conversion
  convertedPrice: ConvertedPrice | null;
  swapQuote: SwapQuote | null;
  isFetchingConversion: boolean;
  conversionError: Error | null;

  // State flags
  isTokenSelectionLocked: boolean;

  // Reset
  resetTokenSelection: () => void;
}

/**
 * Hook for managing token selection and price conversion for onchain purchases
 */
export function useTokenSelection({
  controller,
  starterpackDetails,
  quantity,
  selectedPlatform,
}: UseTokenSelectionOptions): UseTokenSelectionReturn {
  const [selectedToken, setSelectedTokenState] = useState<
    TokenOption | undefined
  >();
  const [convertedPrice, setConvertedPrice] = useState<ConvertedPrice | null>(
    null,
  );
  const [swapQuote, setSwapQuote] = useState<SwapQuote | null>(null);
  const [isFetchingConversion, setIsFetchingConversion] = useState(false);
  const [conversionError, setConversionError] = useState<Error | null>(null);
  const [fetchedTokenMetadata, setFetchedTokenMetadata] = useState<
    Record<string, FullTokenMetadata>
  >({});

  const setSelectedToken = useCallback((token: TokenOption | undefined) => {
    setSelectedTokenState(token);
  }, []);

  const resetTokenSelection = useCallback(() => {
    setSelectedToken(undefined);
    setConvertedPrice(null);
    setSwapQuote(null);
    setConversionError(null);
  }, [setSelectedToken]);

  // Available tokens for onchain purchases
  const availableTokens = useMemo(() => {
    if (!controller) return [];

    const usdcAddress =
      USDC_ADDRESSES[controller.chainId()] ||
      USDC_ADDRESSES[constants.StarknetChainId.SN_MAIN];
    const tokenMetadata: ERC20Metadata[] = [
      ...DEFAULT_TOKENS,
      {
        address: usdcAddress,
        name: "USD Coin",
        symbol: "USDC",
        decimals: 6,
        icon: "https://static.cartridge.gg/tokens/usdc.svg",
      },
    ];

    const isAlreadyIncluded = (address: string) =>
      tokenMetadata.some(
        (token) =>
          getChecksumAddress(token.address) === getChecksumAddress(address),
      );

    if (starterpackDetails?.additionalPaymentTokens) {
      for (const tokenAddress of starterpackDetails.additionalPaymentTokens) {
        if (isAlreadyIncluded(tokenAddress)) continue;

        const checksumAddress = getChecksumAddress(tokenAddress);
        const presetMetadata = erc20Metadata.find(
          (m) =>
            getChecksumAddress(m.l2_token_address) ===
            getChecksumAddress(checksumAddress),
        );

        if (presetMetadata) {
          // Found in erc20Metadata - use its info
          tokenMetadata.push({
            address: checksumAddress,
            name: presetMetadata.name,
            symbol: presetMetadata.symbol,
            decimals: presetMetadata.decimals,
            icon: presetMetadata.logo_url || makeBlockie(checksumAddress),
          });
        } else {
          // Check if we've fetched metadata for this token
          const fetched = fetchedTokenMetadata[checksumAddress];
          if (fetched) {
            tokenMetadata.push({
              address: checksumAddress,
              name: fetched.name,
              symbol: fetched.symbol,
              decimals: fetched.decimals,
              icon: makeBlockie(checksumAddress),
            });
          } else {
            // Not in erc20Metadata and not fetched yet - use placeholder
            tokenMetadata.push({
              address: checksumAddress,
              name: "Loading...",
              symbol: "...",
              decimals: 18,
              icon: makeBlockie(checksumAddress),
            });
          }
        }
      }
    } else if (starterpackDetails && isOnchainStarterpack(starterpackDetails)) {
      // No payment tokens specified - add payment token from quote if not already in list
      const quote = starterpackDetails.quote;
      if (quote) {
        const paymentTokenAddress = getChecksumAddress(quote.paymentToken);
        if (!isAlreadyIncluded(paymentTokenAddress)) {
          const icon =
            erc20Metadata.find(
              (token) =>
                BigInt(token.l2_token_address) === BigInt(paymentTokenAddress),
            )?.logo_url || makeBlockie(paymentTokenAddress);
          tokenMetadata.push({
            address: paymentTokenAddress,
            name: quote.paymentTokenMetadata.symbol,
            symbol: quote.paymentTokenMetadata.symbol,
            decimals: quote.paymentTokenMetadata.decimals,
            icon: icon,
          });
        }
      }
    }

    const tokens: TokenOption[] = tokenMetadata.map((token) => ({
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      address: getChecksumAddress(token.address),
      icon: token.icon,
      contract: new ERC20Contract({
        address: getChecksumAddress(token.address),
        provider: controller.provider,
      }),
    }));

    return tokens;
  }, [controller, starterpackDetails, fetchedTokenMetadata]);

  // Fetch metadata for tokens not in erc20Metadata
  useEffect(() => {
    if (!controller || !starterpackDetails?.additionalPaymentTokens) return;

    const fetchUnknownTokenMetadata = async () => {
      const unknownTokens = starterpackDetails.additionalPaymentTokens!.filter(
        (tokenAddress) => {
          const checksumAddress = getChecksumAddress(tokenAddress);
          // Skip if already in erc20Metadata
          const inPresets = erc20Metadata.some(
            (m) =>
              getChecksumAddress(m.l2_token_address) ===
              getChecksumAddress(checksumAddress),
          );
          if (inPresets) return false;
          // Skip if already fetched
          if (fetchedTokenMetadata[checksumAddress]) return false;
          return true;
        },
      );

      if (unknownTokens.length === 0) return;

      // Fetch metadata for all unknown tokens in parallel
      const results = await Promise.allSettled(
        unknownTokens.map(async (tokenAddress) => {
          const checksumAddress = getChecksumAddress(tokenAddress);
          const metadata = await fetchTokenMetadata(
            checksumAddress,
            controller.provider,
          );
          return { address: checksumAddress, metadata };
        }),
      );

      // Update state with fetched metadata
      const newMetadata: Record<string, FullTokenMetadata> = {};
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          newMetadata[result.value.address] = result.value.metadata;
        }
      });

      if (Object.keys(newMetadata).length > 0) {
        setFetchedTokenMetadata((prev) => ({ ...prev, ...newMetadata }));
      }
    };

    fetchUnknownTokenMetadata();
  }, [
    controller,
    starterpackDetails?.additionalPaymentTokens,
    fetchedTokenMetadata,
  ]);

  // Token selection is locked when using Layerswap (non-Starknet platforms)
  const isTokenSelectionLocked = useMemo(() => {
    return selectedPlatform !== undefined && selectedPlatform !== "starknet";
  }, [selectedPlatform]);

  // Auto-select USDC when using Layerswap
  useEffect(() => {
    if (isTokenSelectionLocked && availableTokens.length > 0) {
      const usdcToken = availableTokens.find(
        (token) => token.symbol === "USDC",
      );
      if (usdcToken && selectedToken?.symbol !== "USDC") {
        setSelectedToken(usdcToken);
      }
    }
  }, [
    isTokenSelectionLocked,
    availableTokens,
    selectedToken,
    setSelectedToken,
  ]);

  // Set selected token to payment token and initialize convertedPrice from quote
  useEffect(() => {
    if (
      starterpackDetails &&
      isOnchainStarterpack(starterpackDetails) &&
      availableTokens.length > 0
    ) {
      const quote = starterpackDetails.quote;
      if (quote) {
        const paymentTokenAddress = getChecksumAddress(
          quote.paymentToken,
        ).toLowerCase();

        // Set selected token to payment token if not set
        if (!selectedToken) {
          const paymentToken = availableTokens.find(
            (token: TokenOption) =>
              token.address.toLowerCase() === paymentTokenAddress,
          );
          if (paymentToken) {
            setSelectedToken(paymentToken);
          }
        }

        // Initialize convertedPrice from quote if available
        if (selectedToken) {
          const convertedPriceFromQuote = quote.convertedPrice;
          if (convertedPriceFromQuote) {
            const targetToken = selectedToken.address.toLowerCase();
            if (convertedPriceFromQuote.token.toLowerCase() === targetToken) {
              setConvertedPrice({
                amount: convertedPriceFromQuote.amount,
                tokenMetadata: convertedPriceFromQuote.tokenMetadata,
                quantity: quantity,
              });

              setSwapQuote(null);
            }
          }
        }
      }
    }
  }, [
    starterpackDetails,
    selectedToken,
    availableTokens,
    quantity,
    setSelectedToken,
  ]);

  // Fetch conversion price when selected token or quote changes
  useEffect(() => {
    if (!controller || !selectedToken || !starterpackDetails) return;

    if (!isOnchainStarterpack(starterpackDetails)) return;
    const quote = starterpackDetails.quote;
    if (!quote || quote.totalCost === BigInt(0)) return;

    const paymentToken = quote.paymentToken.toLowerCase();
    const targetToken = selectedToken.address.toLowerCase();

    // Don't fetch if payment token is the same as selected token
    if (num.toHex(paymentToken) === num.toHex(targetToken)) {
      setConvertedPrice(null);
      setSwapQuote(null);
      setIsFetchingConversion(false);
      setConversionError(null);
      return;
    }

    // Check if we already have valid data
    if (
      convertedPrice &&
      swapQuote &&
      convertedPrice.tokenMetadata.symbol === selectedToken.symbol &&
      convertedPrice.quantity === quantity
    ) {
      return;
    }

    const fetchConversion = async () => {
      setIsFetchingConversion(true);
      setConversionError(null);
      try {
        const fetchedSwapQuote = await fetchSwapQuote(
          quote.totalCost * BigInt(quantity),
          quote.paymentToken,
          selectedToken.address,
          controller.chainId(),
        );

        const tokenMetadata = await fetchTokenMetadata(
          selectedToken.address,
          controller.provider,
        );

        setConvertedPrice({
          amount: fetchedSwapQuote.total,
          quantity: quantity,
          tokenMetadata: {
            symbol: tokenMetadata.symbol,
            decimals: tokenMetadata.decimals,
          },
        });
        setSwapQuote(fetchedSwapQuote);
        setConversionError(null);
      } catch (error) {
        console.error("Failed to fetch conversion price:", error);
        setConvertedPrice(null);
        setSwapQuote(null);
        setConversionError(error as Error);
      } finally {
        setIsFetchingConversion(false);
      }
    };

    fetchConversion();
  }, [
    controller,
    selectedToken,
    starterpackDetails,
    convertedPrice,
    swapQuote,
    quantity,
  ]);

  return {
    availableTokens,
    selectedToken,
    setSelectedToken,
    convertedPrice,
    swapQuote,
    isFetchingConversion,
    conversionError,
    isTokenSelectionLocked,
    resetTokenSelection,
  };
}
