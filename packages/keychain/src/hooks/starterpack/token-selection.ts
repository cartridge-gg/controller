import { useState, useCallback, useEffect, useMemo } from "react";
import { erc20Metadata, ExternalPlatform } from "@cartridge/controller";
import { num, getChecksumAddress, constants } from "starknet";
import { ERC20 as ERC20Contract } from "@cartridge/ui/utils";
import {
  DEFAULT_TOKENS,
  type ERC20Metadata,
} from "@/components/provider/tokens";
import { fetchSwapQuote, USDC_ADDRESSES, type SwapQuote } from "@/utils/ekubo";
import { fetchTokenMetadata, type TokenMetadata } from "@/utils/token-metadata";
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

export interface ConvertedPrice {
  amount: bigint;
  quantity: number;
  tokenMetadata: TokenMetadata;
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

    // Add payment token from quote if not already in list
    if (starterpackDetails && isOnchainStarterpack(starterpackDetails)) {
      const quote = starterpackDetails.quote;
      if (quote) {
        const paymentTokenAddress = getChecksumAddress(quote.paymentToken);
        const isAlreadyIncluded = tokenMetadata.some(
          (token) => getChecksumAddress(token.address) === paymentTokenAddress,
        );

        if (!isAlreadyIncluded) {
          const icon =
            erc20Metadata.find(
              (token) =>
                BigInt(token.l2_token_address) === BigInt(paymentTokenAddress),
            )?.logo_url || makeBlockie(getChecksumAddress(paymentTokenAddress));
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
  }, [controller, starterpackDetails]);

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
