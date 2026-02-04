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
import { useConnection } from "../connection";

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
  starterpackDetails,
  quantity,
  selectedPlatform,
}: UseTokenSelectionOptions): UseTokenSelectionReturn {
  const { controller } = useConnection();
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

  // Helper: Find token in erc20Metadata presets
  const findPresetMetadata = useCallback((address: string) => {
    return erc20Metadata.find(
      (m) =>
        getChecksumAddress(m.l2_token_address) === getChecksumAddress(address),
    );
  }, []);

  // Helper: Build ERC20Metadata from various sources (preset, fetched, or placeholder)
  const buildTokenMetadata = useCallback(
    (address: string): ERC20Metadata => {
      const checksumAddress = getChecksumAddress(address);

      // Try preset metadata first
      const preset = findPresetMetadata(checksumAddress);
      if (preset) {
        return {
          address: checksumAddress,
          name: preset.name,
          symbol: preset.symbol,
          decimals: preset.decimals,
          icon: preset.logo_url || makeBlockie(checksumAddress),
        };
      }

      // Try fetched metadata from RPC
      const fetched = fetchedTokenMetadata[checksumAddress];
      if (fetched) {
        return {
          address: checksumAddress,
          name: fetched.name,
          symbol: fetched.symbol,
          decimals: fetched.decimals,
          icon: makeBlockie(checksumAddress),
        };
      }

      // Fallback to placeholder while loading
      return {
        address: checksumAddress,
        name: "...",
        symbol: "...",
        decimals: 18,
        icon: makeBlockie(checksumAddress),
      };
    },
    [findPresetMetadata, fetchedTokenMetadata],
  );

  // Available tokens for onchain purchases
  const availableTokens = useMemo(() => {
    if (!controller) return [];

    // Start with default tokens (ETH, STRK, USDC)
    const usdcAddress =
      USDC_ADDRESSES[controller.chainId()] ||
      USDC_ADDRESSES[constants.StarknetChainId.SN_MAIN];

    const tokens: ERC20Metadata[] = [
      {
        address: usdcAddress,
        name: "USD Coin",
        symbol: "USDC",
        decimals: 6,
        icon: "https://static.cartridge.gg/tokens/usdc.svg",
      },
      ...DEFAULT_TOKENS,
    ];

    const isIncluded = (address: string) =>
      tokens.some(
        (t) => getChecksumAddress(t.address) === getChecksumAddress(address),
      );

    // Add additional payment tokens from starterpack metadata
    if (starterpackDetails?.additionalPaymentTokens?.length) {
      for (const address of starterpackDetails.additionalPaymentTokens) {
        if (!isIncluded(address)) {
          tokens.push(buildTokenMetadata(address));
        }
      }
    }
    // Or add quote's payment token if no additional tokens specified
    else if (
      starterpackDetails &&
      isOnchainStarterpack(starterpackDetails) &&
      starterpackDetails.quote
    ) {
      const { paymentToken, paymentTokenMetadata } = starterpackDetails.quote;
      const address = getChecksumAddress(paymentToken);

      if (!isIncluded(address)) {
        const preset = findPresetMetadata(address);
        tokens.push({
          address,
          name: paymentTokenMetadata.symbol,
          symbol: paymentTokenMetadata.symbol,
          decimals: paymentTokenMetadata.decimals,
          icon: preset?.logo_url || makeBlockie(address),
        });
      }
    }

    // Convert to TokenOption with ERC20Contract instances
    return tokens.map((token) => ({
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
  }, [controller, starterpackDetails, buildTokenMetadata, findPresetMetadata]);

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
      if (usdcToken) {
        // Only override if not already set to USDC (avoid infinite loop)
        // AND ensure we trigger the conversion logic by setting it
        if (selectedToken?.symbol !== "USDC") {
          setSelectedToken(usdcToken);
        }
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
        // Set selected token to payment token if not set
        if (!selectedToken) {
          const paymentToken =
            availableTokens.find(
              (token: TokenOption) =>
                num.toHex(token.address) === num.toHex(quote.paymentToken),
            ) || availableTokens[0];
          if (paymentToken) {
            setSelectedToken(paymentToken);
          }
        }
      }
    }
  }, [starterpackDetails, selectedToken, availableTokens, setSelectedToken]);

  // Fetch conversion price when selected token or quote changes
  useEffect(() => {
    if (!controller || !selectedToken || !starterpackDetails) return;

    if (!isOnchainStarterpack(starterpackDetails)) return;
    const quote = starterpackDetails.quote;
    if (!quote || quote.totalCost === BigInt(0)) return;

    const paymentToken = quote.paymentToken.toLowerCase();
    const targetToken = selectedToken.address.toLowerCase();

    // 1. Check if tokens match (No swap needed)
    const isMatchingToken = num.toHex(paymentToken) === num.toHex(targetToken);
    if (isMatchingToken) {
      const expectedAmount = quote.totalCost * BigInt(quantity);
      if (
        convertedPrice?.amount === expectedAmount &&
        convertedPrice?.quantity === quantity &&
        swapQuote === null
      ) {
        return;
      }

      setConvertedPrice({
        amount: expectedAmount,
        quantity: quantity,
        tokenMetadata: quote.paymentTokenMetadata,
      });
      setSwapQuote(null);
      setIsFetchingConversion(false);
      setConversionError(null);
      return;
    }

    // 2. Otherwise, fetch from Ekubo (if not already valid)
    if (
      convertedPrice &&
      swapQuote &&
      convertedPrice.tokenMetadata.symbol === selectedToken.symbol &&
      convertedPrice.quantity === quantity &&
      convertedPrice.amount === swapQuote.total
    ) {
      return;
    }

    const fetchConversion = async () => {
      // Use the token from availableTokens to ensure we have the latest metadata
      const activeToken =
        availableTokens.find((t) => t.address === selectedToken.address) ||
        selectedToken;

      setIsFetchingConversion(true);
      setConversionError(null);
      try {
        const fetchedSwapQuote = await fetchSwapQuote(
          quote.totalCost * BigInt(quantity),
          quote.paymentToken,
          activeToken.address,
          controller.chainId(),
        );

        setConvertedPrice({
          amount: fetchedSwapQuote.total,
          quantity: quantity,
          tokenMetadata: {
            symbol: activeToken.symbol,
            decimals: activeToken.decimals,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controller, selectedToken, starterpackDetails, quantity]);

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
