import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import {
  erc20Metadata,
  ExternalPlatform,
  ExternalWallet,
} from "@cartridge/controller";
import { useConnection } from "@/hooks/connection";
import { usdcToUsd } from "@/utils/starterpack";
import {
  uint256,
  Call,
  num,
  cairo,
  RpcProvider,
  shortString,
  getChecksumAddress,
} from "starknet";
import { isOnchainStarterpack } from "./types";
import { getCurrentReferral } from "@/utils/referral";
import { ERC20 as ERC20Contract } from "@cartridge/ui/utils";
import {
  DEFAULT_TOKENS,
  type ERC20Metadata,
} from "@/components/provider/tokens";
import {
  fetchSwapQuote,
  generateSwapCalls,
  chainIdToEkuboNetwork,
  USDC_ADDRESSES,
  EKUBO_ROUTER_ADDRESSES,
  type SwapQuote,
} from "@/utils/ekubo";
import type { TokenMetadata } from "./types";
import { useWallets } from "@/hooks/wallets";
import { Explorer, useLayerswapDeposit } from "@/hooks/payments/crypto";
import { depositToLayerswapInput } from "@/utils/payments";
import { CreateLayerswapDepositInput } from "@cartridge/ui/utils/api/cartridge";
import makeBlockie from "ethereum-blockies-base64";
import { Item } from "./types";
import { useStarterpackContext } from "./starterpack";

export interface TokenOption {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  icon: string;
  contract: ERC20Contract;
}

export interface OnchainPurchaseContextType {
  // Purchase items
  purchaseItems: Item[];

  // Quantity management
  quantity: number;
  incrementQuantity: () => void;
  decrementQuantity: () => void;

  // Wallet state
  selectedWallet: ExternalWallet | undefined;
  selectedPlatform: ExternalPlatform | undefined;
  walletAddress: string | undefined;
  clearSelectedWallet: () => void;

  // Token selection
  availableTokens: TokenOption[];
  selectedToken: TokenOption | undefined;
  setSelectedToken: (token: TokenOption | undefined) => void;
  convertedPrice: {
    amount: bigint;
    tokenMetadata: { symbol: string; decimals: number };
  } | null;
  swapQuote: SwapQuote | null;
  isFetchingConversion: boolean;
  isTokenSelectionLocked: boolean;
  conversionError: Error | null;

  // USD amount (derived from quote)
  usdAmount: number;

  // Layerswap state (for future use)
  layerswapFees: string | undefined;
  isFetchingFees: boolean;
  swapId: string | undefined;
  explorer: Explorer | undefined;
  depositAmount: number | undefined;
  setDepositAmount: (amount: number) => void;

  // Actions
  onOnchainPurchase: () => Promise<void>;
  onExternalConnect: (
    wallet: ExternalWallet,
    platform: ExternalPlatform,
    chainId?: string,
  ) => Promise<string | undefined>;
  onBackendCryptoPurchase: () => Promise<void>;
  waitForDeposit: (swapId: string) => Promise<boolean>;
  fetchFees: () => Promise<void>;
}

export const OnchainPurchaseContext = createContext<
  OnchainPurchaseContextType | undefined
>(undefined);

export interface OnchainPurchaseProviderProps {
  children: ReactNode;
}

export const OnchainPurchaseProvider = ({
  children,
}: OnchainPurchaseProviderProps) => {
  const { controller, isMainnet, origin, externalSendTransaction } =
    useConnection();
  const { error: walletError, connectWallet, switchChain } = useWallets();
  const {
    starterpackId,
    starterpackDetails,
    setTransactionHash,
    setDisplayError,
  } = useStarterpackContext();

  const [purchaseItems, setPurchaseItems] = useState<Item[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedWallet, setSelectedWallet] = useState<
    ExternalWallet | undefined
  >();
  const [selectedPlatform, setSelectedPlatform] = useState<
    ExternalPlatform | undefined
  >();
  const [walletAddress, setWalletAddress] = useState<string | undefined>();
  const [selectedToken, setSelectedTokenState] = useState<
    TokenOption | undefined
  >();
  const [convertedPrice, setConvertedPrice] = useState<{
    amount: bigint;
    quantity: number;
    tokenMetadata: { symbol: string; decimals: number };
  } | null>(null);
  const [swapQuote, setSwapQuote] = useState<SwapQuote | null>(null);
  const [isFetchingConversion, setIsFetchingConversion] = useState(false);
  const [conversionError, setConversionError] = useState<Error | null>(null);
  const [usdAmount, setUsdAmount] = useState(0);

  // Layerswap state
  const [depositAmount, setDepositAmount] = useState<number | undefined>();
  const [layerswapFees, setLayerswapFees] = useState<string | undefined>();
  const [swapId, setSwapId] = useState<string | undefined>();
  const [explorer, setExplorer] = useState<Explorer | undefined>();
  const [isFetchingFees, setIsFetchingFees] = useState(false);
  const [swapInput, setSwapInput] = useState<CreateLayerswapDepositInput>();

  const {
    error: depositError,
    sendDeposit,
    estimateLayerswapFees,
    waitForDeposit,
  } = useLayerswapDeposit();

  // Wrapper for setSelectedToken
  const setSelectedToken = useCallback((token: TokenOption | undefined) => {
    setSelectedTokenState(token);
  }, []);

  const incrementQuantity = useCallback(() => {
    setQuantity((prev) => prev + 1);
  }, []);

  const decrementQuantity = useCallback(() => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  }, []);

  const clearSelectedWallet = useCallback(() => {
    setSelectedWallet(undefined);
  }, []);

  // Helper function to fetch token metadata
  const fetchTokenMetadata = useCallback(
    async (
      tokenAddress: string,
      provider: RpcProvider,
    ): Promise<TokenMetadata> => {
      const [symbolRes, decimalsRes] = await Promise.all([
        provider.callContract({
          contractAddress: tokenAddress,
          entrypoint: "symbol",
          calldata: [],
        } as Call),
        provider.callContract({
          contractAddress: tokenAddress,
          entrypoint: "decimals",
          calldata: [],
        } as Call),
      ]);

      return {
        symbol: shortString.decodeShortString(symbolRes[0]),
        decimals: Number(decimalsRes[0]),
      };
    },
    [],
  );

  // Available tokens for onchain purchases
  const availableTokens = useMemo(() => {
    if (!controller) return [];

    const tokenMetadata: ERC20Metadata[] = [
      ...DEFAULT_TOKENS,
      {
        address: isMainnet ? USDC_ADDRESSES.mainnet : USDC_ADDRESSES.sepolia,
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
  }, [controller, starterpackDetails, isMainnet]);

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

  // Reset state when starterpack changes
  useEffect(() => {
    setSelectedToken(undefined);
    setConvertedPrice(null);
    setSwapQuote(null);
    setConversionError(null);
    setQuantity(1);
    setPurchaseItems([]);
  }, [starterpackId, setSelectedToken]);

  // Update purchase items and USD amount when starterpack details change
  useEffect(() => {
    if (starterpackDetails && isOnchainStarterpack(starterpackDetails)) {
      setPurchaseItems(starterpackDetails.items);
      const totalUsd = starterpackDetails.quote
        ? usdcToUsd(starterpackDetails.quote.totalCost)
        : 0;
      setUsdAmount(totalUsd);
    }
  }, [starterpackDetails]);

  // Token selection is locked when using Layerswap
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
        const network = chainIdToEkuboNetwork(controller.chainId());
        const fetchedSwapQuote = await fetchSwapQuote(
          quote.totalCost * BigInt(quantity),
          quote.paymentToken,
          selectedToken.address,
          network,
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
    fetchTokenMetadata,
    convertedPrice,
    swapQuote,
    quantity,
  ]);

  // Compute swap input for Layerswap
  useEffect(() => {
    const getSwapInput = () => {
      if (!controller || starterpackId === undefined || !selectedPlatform) {
        setSwapInput(undefined);
        return;
      }

      if (selectedPlatform !== "starknet" && depositAmount) {
        const input = depositToLayerswapInput(
          depositAmount,
          Number(layerswapFees || 0),
          controller.username(),
          selectedPlatform,
          isMainnet,
        );
        setSwapInput(input);
      }
    };
    getSwapInput();
  }, [
    controller,
    depositAmount,
    layerswapFees,
    starterpackId,
    selectedPlatform,
    isMainnet,
  ]);

  // Sync errors
  useEffect(() => {
    if (walletError) {
      setDisplayError(walletError);
    }
    if (depositError) {
      setDisplayError(depositError);
    }
  }, [walletError, depositError, setDisplayError]);

  const onOnchainPurchase = useCallback(async () => {
    if (!controller || !starterpackDetails) return;

    if (!isOnchainStarterpack(starterpackDetails)) {
      throw new Error("Not an onchain starterpack");
    }

    const { quote, id: packId } = starterpackDetails;

    if (!quote) {
      throw new Error("Quote not loaded yet");
    }

    try {
      const registryContract = import.meta.env
        .VITE_STARTERPACK_REGISTRY_CONTRACT;
      const recipient = controller.address();

      const walletType =
        selectedWallet?.type === "argent" || selectedWallet?.type === "braavos"
          ? selectedWallet.type
          : "controller";

      const needsSwap =
        selectedToken &&
        num.toHex(selectedToken.address) !== num.toHex(quote.paymentToken);

      const totalCostWithQuantity = quote.totalCost * BigInt(quantity);

      let allCalls: Call[] = [];

      // Add swap calls if needed
      if (needsSwap && selectedToken) {
        try {
          if (!swapQuote) {
            throw new Error("No swap quote found");
          }

          const network = chainIdToEkuboNetwork(controller.chainId());

          const scaledSwapQuote: SwapQuote = {
            impact: swapQuote.impact,
            total: swapQuote.total * BigInt(quantity),
            splits: swapQuote.splits.map((split) => ({
              ...split,
              amount_specified: (
                BigInt(split.amount_specified) * BigInt(quantity)
              ).toString(),
            })),
          };

          const routerAddress = EKUBO_ROUTER_ADDRESSES[network];
          const swapAmount =
            scaledSwapQuote.total < 0n
              ? -scaledSwapQuote.total
              : scaledSwapQuote.total;
          const doubledTotal = swapAmount * 2n;
          const totalQuoteSum =
            doubledTotal < swapAmount + BigInt(1e19)
              ? doubledTotal
              : swapAmount + BigInt(1e19);

          const approveSelectedTokenAmount = uint256.bnToUint256(totalQuoteSum);
          const approveSelectedTokenCall: Call = {
            contractAddress: selectedToken.address,
            entrypoint: "approve",
            calldata: [
              routerAddress,
              approveSelectedTokenAmount.low,
              approveSelectedTokenAmount.high,
            ],
          };

          const swapCallsWithoutApprove = generateSwapCalls(
            selectedToken.address,
            quote.paymentToken,
            totalCostWithQuantity,
            scaledSwapQuote,
            network,
          );

          allCalls = [approveSelectedTokenCall, ...swapCallsWithoutApprove];
        } catch (error) {
          console.error("Failed to generate swap calls:", error);
          throw new Error(
            `Failed to prepare swap: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }

      const amount256 = uint256.bnToUint256(totalCostWithQuantity);

      const approvePaymentTokenCall: Call = {
        contractAddress: quote.paymentToken,
        entrypoint: "approve",
        calldata: [registryContract, amount256.low, amount256.high],
      };

      const referralData = getCurrentReferral(origin);

      const issueCall: Call = {
        contractAddress: registryContract,
        entrypoint: "issue",
        calldata: [
          recipient,
          packId,
          quantity,
          ...(referralData?.refAddress
            ? [0x0, num.toHex(referralData.refAddress)]
            : [0x1]),
          ...(referralData?.refGroup
            ? [0x0, num.toHex(cairo.felt(referralData.refGroup))]
            : [0x1]),
        ],
      };

      allCalls = [...allCalls, approvePaymentTokenCall, issueCall];

      let purchaseTransactionHash: string;

      if (walletType === "controller") {
        const result = await controller.execute(allCalls);
        purchaseTransactionHash = result.transaction_hash;
      } else {
        if (!externalSendTransaction) {
          throw new Error(
            "externalSendTransaction is required for external wallet type",
          );
        }

        const externalCalls = allCalls.map((call) => ({
          contract_address: call.contractAddress,
          entry_point: call.entrypoint,
          calldata: call.calldata,
        }));

        const response = await externalSendTransaction(
          walletType,
          externalCalls,
        );
        if (!response.success) {
          throw new Error(
            response.error || `Failed to execute purchase with ${walletType}`,
          );
        }
        if (!response.result) {
          throw new Error(`No transaction hash returned from ${walletType}`);
        }
        const result = response.result as { transaction_hash?: string };
        const transactionHash = result.transaction_hash;
        if (!transactionHash) {
          throw new Error(
            `Invalid response format from ${walletType}: missing transaction_hash`,
          );
        }
        purchaseTransactionHash = transactionHash;
      }

      setTransactionHash(purchaseTransactionHash);
    } catch (e) {
      setDisplayError(e as Error);
      throw e;
    }
  }, [
    controller,
    starterpackDetails,
    origin,
    selectedToken,
    swapQuote,
    selectedWallet,
    quantity,
    externalSendTransaction,
    setTransactionHash,
    setDisplayError,
  ]);

  const onExternalConnect = useCallback(
    async (
      wallet: ExternalWallet,
      platform: ExternalPlatform,
      chainId?: string | number,
    ): Promise<string | undefined> => {
      if (!controller) return;

      try {
        setSelectedWallet(wallet);
        setSelectedPlatform(platform);
        const res = await connectWallet(wallet.type);
        if (!res?.success) {
          const error = new Error(
            `Failed to connect to ${wallet.name} - ${res?.error || "Unknown error"}`,
          );
          throw error;
        }

        setWalletAddress(res.account);

        if (chainId) {
          if (wallet.type === "braavos") {
            console.warn(
              "Braavos does not support `wallet_switchStarknetChain`",
            );
          } else {
            const res = await switchChain(wallet.type, chainId.toString());
            if (!res) {
              const error = new Error(
                `${wallet.name} failed to switch chain (${chainId})`,
              );
              throw error;
            }
          }
        }

        return res.account;
      } catch (e) {
        setDisplayError(e as Error);
        throw e;
      }
    },
    [controller, connectWallet, switchChain, setDisplayError],
  );

  const onBackendCryptoPurchase = useCallback(async () => {
    if (
      !controller ||
      !selectedPlatform ||
      !walletAddress ||
      !selectedWallet?.type ||
      !layerswapFees ||
      !swapInput
    )
      return;

    try {
      swapInput.layerswapFees = layerswapFees;

      const result = await sendDeposit(
        swapInput,
        walletAddress,
        selectedWallet.type,
        selectedPlatform,
        (explorer) => {
          setExplorer(explorer);
        },
      );
      setSwapId(result.swapId);
      if (result.transactionHash) {
        setTransactionHash(result.transactionHash);
      }
    } catch (e) {
      setDisplayError(e as Error);
      throw e;
    }
  }, [
    controller,
    selectedPlatform,
    walletAddress,
    selectedWallet,
    swapInput,
    layerswapFees,
    sendDeposit,
    setTransactionHash,
    setDisplayError,
  ]);

  const fetchFees = useCallback(async () => {
    if (!swapInput) return;

    try {
      setIsFetchingFees(true);

      const quote = await estimateLayerswapFees(swapInput);
      setLayerswapFees(quote.totalFees);
    } catch (e) {
      setDisplayError(e as Error);
      throw e;
    } finally {
      setIsFetchingFees(false);
    }
  }, [swapInput, estimateLayerswapFees, setDisplayError]);

  const contextValue: OnchainPurchaseContextType = {
    purchaseItems,
    quantity,
    incrementQuantity,
    decrementQuantity,
    selectedWallet,
    selectedPlatform,
    walletAddress,
    clearSelectedWallet,
    availableTokens,
    selectedToken,
    setSelectedToken,
    convertedPrice,
    swapQuote,
    isFetchingConversion,
    isTokenSelectionLocked,
    conversionError,
    usdAmount,
    layerswapFees,
    isFetchingFees,
    swapId,
    explorer,
    depositAmount,
    setDepositAmount,
    onOnchainPurchase,
    onExternalConnect,
    onBackendCryptoPurchase,
    waitForDeposit,
    fetchFees,
  };

  return (
    <OnchainPurchaseContext.Provider value={contextValue}>
      {children}
    </OnchainPurchaseContext.Provider>
  );
};

export const useOnchainPurchaseContext = () => {
  const context = useContext(OnchainPurchaseContext);
  if (!context) {
    throw new Error(
      "useOnchainPurchaseContext must be used within OnchainPurchaseProvider",
    );
  }
  return context;
};
