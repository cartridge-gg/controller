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
  ExternalPlatform,
  ExternalWallet,
  ExternalWalletType,
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
import { isOnchainStarterpack } from "@/types/starterpack-types";
import { getCurrentReferral } from "@/utils/referral";
import { USDC_CONTRACT_ADDRESS } from "@cartridge/ui/utils";
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
import type { TokenMetadata } from "@/types/starterpack-types";

import useStripePayment from "@/hooks/payments/stripe";
import { usdToCredits } from "@/hooks/tokens";
import { USD_AMOUNTS } from "@/components/funding/AmountSelection";
import { Stripe } from "@stripe/stripe-js";
import { useWallets } from "@/hooks/wallets";
import { Explorer, useCryptoPayment } from "@/hooks/payments/crypto";
import { useStarterPack } from "@/hooks/starterpack";
import { useStarterPackOnchain } from "@/hooks/starterpack-onchain";
import { starterPackToLayerswapInput } from "@/utils/payments";
import {
  CreateLayerswapPaymentInput,
  StarterpackAcquisitionType,
} from "@cartridge/ui/utils/api/cartridge";
import {
  StarterpackDetails,
  detectStarterpackSource,
} from "@/types/starterpack-types";

const CARTRIDGE_FEE = 0.025;

export interface CostDetails {
  baseCostInCents: number;
  processingFeeInCents: number;
  totalInCents: number;
}

export interface Network {
  id: string;
  name: string;
  icon: React.ReactElement;
}

export enum ItemType {
  CREDIT = "CREDIT",
  ERC20 = "ERC20",
  NFT = "NFT",
}

export type Item = {
  title: string;
  subtitle?: string;
  icon: string | React.ReactNode;
  value?: number;
  type: ItemType;
};

export type PaymentMethod = "stripe" | "crypto";

export interface TokenOption {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  icon: string;
  contract: ERC20Contract;
}

export interface PurchaseContextType {
  // Purchase details
  usdAmount: number;
  starterpackDetails?: StarterpackDetails;

  teamId?: string;
  purchaseItems: Item[];
  claimItems: Item[];
  layerswapFees?: string;
  isFetchingFees: boolean;

  // Payment state
  paymentMethod?: PaymentMethod;
  selectedWallet?: ExternalWallet;
  selectedPlatform?: ExternalPlatform;
  walletAddress?: string;
  wallets?: ExternalWallet[];
  transactionHash?: string;
  paymentId?: string;
  explorer?: Explorer;
  ethereumPrivateKey?: string; // Optional Ethereum private key for claim signing

  // Stripe state
  clientSecret?: string;
  costDetails?: CostDetails;
  stripePromise: Promise<Stripe | null>;

  // Loading states
  isStripeLoading: boolean;
  isCryptoLoading: boolean;
  isStarterpackLoading: boolean;

  // Error state
  displayError?: Error;
  clearError: () => void;

  // Wallet management
  clearSelectedWallet: () => void;

  // Token selection (for onchain purchases)
  availableTokens: TokenOption[];
  selectedToken?: TokenOption;
  setSelectedToken: (token: TokenOption | undefined) => void;
  convertedPrice: {
    amount: bigint;
    tokenMetadata: { symbol: string; decimals: number };
  } | null;
  swapQuote: SwapQuote | null; // Full swap quote for executing the swap
  isFetchingConversion: boolean;
  conversionError: Error | null;

  // Actions
  setUsdAmount: (amount: number) => void;
  setPurchaseItems: (items: Item[]) => void;
  setClaimItems: (items: Item[]) => void;
  setStarterpack: (starterpack: string | number) => void;
  setTransactionHash: (hash: string) => void;
  setEthereumPrivateKey: (privateKey: string | undefined) => void;

  // Payment actions
  onCreditCardPurchase: () => Promise<void>;
  onBackendCryptoPurchase: () => Promise<void>;
  onOnchainPurchase: () => Promise<void>;
  onExternalConnect: (
    wallet: ExternalWallet,
    platform: ExternalPlatform,
    chainId?: string,
  ) => Promise<string | undefined>;
  waitForPayment: (paymentId: string) => Promise<boolean>;
  fetchFees: () => Promise<void>;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(
  undefined,
);

export interface PurchaseProviderProps {
  children: ReactNode;
  isSlot?: boolean;
}

export const PurchaseProvider = ({
  children,
  isSlot = false,
}: PurchaseProviderProps) => {
  const { controller, isMainnet, origin, externalSendTransaction } =
    useConnection();
  const { error: walletError, connectWallet, switchChain } = useWallets();
  const [starterpack, setStarterpack] = useState<string | number>();
  const [starterpackDetails, setStarterpackDetails] = useState<
    StarterpackDetails | undefined
  >();
  const [usdAmount, setUsdAmount] = useState<number>(USD_AMOUNTS[0]);
  const [layerswapFees, setLayerswapFees] = useState<string | undefined>();
  const [purchaseItems, setPurchaseItems] = useState<Item[]>([]);
  const [claimItems, setClaimItems] = useState<Item[]>([]);
  const [paymentId, setPaymentId] = useState<string | undefined>();
  const [explorer, setExplorer] = useState<Explorer | undefined>();
  const [transactionHash, setTransactionHash] = useState<string | undefined>();
  const [walletAddress, setWalletAddress] = useState<string>();
  const [walletType, setWalletType] = useState<ExternalWalletType>();
  const [clientSecret, setClientSecret] = useState<string | undefined>();
  const [costDetails, setCostDetails] = useState<CostDetails | undefined>();
  const [displayError, setDisplayError] = useState<Error | undefined>();
  const [isFetchingFees, setIsFetchingFees] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<
    ExternalWallet | undefined
  >();
  const [selectedPlatform, setSelectedPlatform] = useState<
    ExternalPlatform | undefined
  >();
  const [paymentMethod, setPaymentMethod] = useState<
    PaymentMethod | undefined
  >();
  const [selectedToken, setSelectedTokenState] = useState<
    TokenOption | undefined
  >();
  const [convertedPrice, setConvertedPrice] = useState<{
    amount: bigint;
    tokenMetadata: { symbol: string; decimals: number };
  } | null>(null);
  const [swapQuote, setSwapQuote] = useState<SwapQuote | null>(null);
  const [isFetchingConversion, setIsFetchingConversion] = useState(false);
  const [conversionError, setConversionError] = useState<Error | null>(null);
  const [ethereumPrivateKey, setEthereumPrivateKey] = useState<
    string | undefined
  >();

  // Wrapper for setSelectedToken that ensures we always have a valid token
  const setSelectedToken = useCallback((token: TokenOption | undefined) => {
    setSelectedTokenState(token);
  }, []);

  const {
    stripePromise,
    isLoading: isStripeLoading,
    error: stripeError,
    createPaymentIntent,
  } = useStripePayment({ isSlot });

  const {
    error: cryptoError,
    isLoading: isCryptoLoading,
    sendPayment,
    estimateStarterPackFees,
    waitForPayment,
  } = useCryptoPayment();

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

  // Get network-specific USDC address
  const usdcAddress = useMemo(() => {
    if (!controller) return USDC_CONTRACT_ADDRESS;
    const network = chainIdToEkuboNetwork(controller.chainId());
    return USDC_ADDRESSES[network];
  }, [controller]);

  // Available tokens for onchain purchases (ETH, STRK, USDC, and payment token if different)
  const availableTokens = useMemo(() => {
    if (!controller) return [];

    // Use DEFAULT_TOKENS from provider and add network-specific USDC
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

    // Add payment token from quote if it's not already in the list
    if (starterpackDetails && isOnchainStarterpack(starterpackDetails)) {
      const quote = starterpackDetails.quote;
      if (quote) {
        const paymentTokenAddress = getChecksumAddress(quote.paymentToken);
        const isAlreadyIncluded = tokenMetadata.some(
          (token) => getChecksumAddress(token.address) === paymentTokenAddress,
        );

        if (!isAlreadyIncluded) {
          tokenMetadata.push({
            address: paymentTokenAddress,
            name: quote.paymentTokenMetadata.symbol,
            symbol: quote.paymentTokenMetadata.symbol,
            decimals: quote.paymentTokenMetadata.decimals,
            icon: "", // No icon for now, as mentioned by user
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
  }, [controller, usdcAddress, starterpackDetails]);

  // Default to USDC if available, otherwise first token
  const defaultToken = useMemo(() => {
    const usdc = availableTokens.find(
      (token: TokenOption) =>
        token.address.toLowerCase() === usdcAddress.toLowerCase(),
    );
    return usdc || availableTokens[0];
  }, [availableTokens, usdcAddress]);

  // Initialize selected token immediately when default token becomes available
  // This ensures USDC (or first token) is selected by default
  useEffect(() => {
    if (defaultToken && !selectedToken) {
      setSelectedToken(defaultToken);
    }
  }, [defaultToken, selectedToken, setSelectedToken]);

  // Also ensure selectedToken is set when tokens first become available
  useEffect(() => {
    if (availableTokens.length > 0 && defaultToken && !selectedToken) {
      setSelectedToken(defaultToken);
    }
  }, [availableTokens.length, defaultToken, selectedToken, setSelectedToken]);

  // Initialize convertedPrice from quote if available and matches selected token
  useEffect(() => {
    if (
      starterpackDetails &&
      isOnchainStarterpack(starterpackDetails) &&
      selectedToken
    ) {
      const quote = starterpackDetails.quote;
      const convertedPriceFromQuote = quote?.convertedPrice;
      if (convertedPriceFromQuote) {
        const targetToken = selectedToken.address.toLowerCase();
        if (convertedPriceFromQuote.token.toLowerCase() === targetToken) {
          setConvertedPrice({
            amount: convertedPriceFromQuote.amount,
            tokenMetadata: convertedPriceFromQuote.tokenMetadata,
          });
        }
      }
    }
  }, [starterpackDetails, selectedToken]);

  // Reset token selection when starterpack changes
  useEffect(() => {
    setSelectedToken(undefined);
    setConvertedPrice(null);
    setSwapQuote(null);
    setConversionError(null);
  }, [starterpack, setSelectedToken]);

  // Fetch conversion price when selected token or quote changes
  useEffect(() => {
    if (!controller || !selectedToken || !starterpackDetails) return;

    if (!isOnchainStarterpack(starterpackDetails)) return;
    const quote = starterpackDetails.quote;
    if (!quote) return;

    const paymentToken = quote.paymentToken.toLowerCase();
    const targetToken = selectedToken.address.toLowerCase();

    // Don't fetch if payment token is the same as selected token
    if (paymentToken === targetToken) {
      setConvertedPrice(null);
      setSwapQuote(null);
      setIsFetchingConversion(false);
      setConversionError(null);
      return;
    }

    // Check if we already have a valid swap quote and converted price for this token
    if (
      convertedPrice &&
      swapQuote &&
      convertedPrice.tokenMetadata.symbol === selectedToken.symbol
    ) {
      // Already have valid data for this token, no need to refetch
      return;
    }

    // Fetch new conversion price (we need the full swap quote for execution)
    const fetchConversion = async () => {
      setIsFetchingConversion(true);
      setConversionError(null); // Clear previous errors
      try {
        const network = chainIdToEkuboNetwork(controller.chainId());
        const fetchedSwapQuote = await fetchSwapQuote(
          quote.totalCost,
          quote.paymentToken,
          selectedToken.address,
          network,
        );

        const tokenMetadata = await fetchTokenMetadata(
          selectedToken.address,
          controller.provider,
        );

        // Store both the converted price for display and the full quote for execution
        setConvertedPrice({
          amount: fetchedSwapQuote.total,
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
  ]);

  // Detect which source (backend or onchain) based on starterpack ID
  const source = detectStarterpackSource(starterpack);

  // Backend hook (GraphQL) - only run if backend source
  const {
    name: backendName,
    items: backendItems,
    supply: backendSupply,
    mintAllowance: backendMintAllowance,
    merkleDrops: backendMerkleDrops,
    priceUsd: backendPriceUsd,
    acquisitionType: backendAcquisitionType,
    isLoading: isBackendLoading,
    error: backendError,
  } = useStarterPack(
    source === "backend" && starterpack !== undefined
      ? String(starterpack)
      : undefined,
  );

  // Onchain hook (Smart contract) - only run if onchain source
  const {
    metadata: onchainMetadata,
    quote: onchainQuote,
    isLoading: isOnchainLoading,
    isQuoteLoading: isOnchainQuoteLoading,
    error: onchainError,
  } = useStarterPackOnchain(
    source === "onchain" && starterpack !== undefined
      ? Number(starterpack)
      : undefined,
  );

  // Unified loading and error state
  const isStarterpackLoading =
    source === "backend" ? isBackendLoading : isOnchainLoading;
  const starterpackError = source === "backend" ? backendError : onchainError;

  const [swapInput, setSwapInput] = useState<CreateLayerswapPaymentInput>();

  useEffect(() => {
    const getSwapInput = () => {
      if (!controller || !starterpack || !selectedPlatform) {
        setSwapInput(undefined);
        return;
      }
      // Skip Layerswap input creation for claim-only starterpacks
      // Claim flows don't need payment/swap setup since they're merkle drops
      // Note: Onchain starterpacks are always PAID, only backend can be CLAIMED
      if (
        source === "backend" &&
        backendAcquisitionType === StarterpackAcquisitionType.Claimed
      ) {
        setSwapInput(undefined);
        return;
      }
      // Layerswap only works for backend starterpacks currently
      if (source === "backend") {
        const input = starterPackToLayerswapInput(
          String(starterpack),
          controller.username(),
          selectedPlatform,
          isMainnet,
        );
        setSwapInput(input);
      } else {
        // TODO: Handle onchain starterpack payments (direct contract interaction)
        setSwapInput(undefined);
      }
    };
    getSwapInput();
  }, [
    controller,
    starterpack,
    selectedPlatform,
    isMainnet,
    source,
    backendAcquisitionType,
  ]);

  // Transform data based on source (backend vs onchain)
  useEffect(() => {
    if (!starterpack) return;

    if (source === "backend") {
      // Backend flow (existing)
      const purchaseItems: Item[] = backendItems.map((item) => {
        const itemPriceUsd = item.price
          ? usdcToUsd(item.price) * (item.amount || 1)
          : 0;

        return {
          title: item.name,
          subtitle: item.description,
          icon: item.iconURL,
          value: itemPriceUsd,
          type: ItemType.NFT,
        };
      });

      setPurchaseItems(purchaseItems);
      setUsdAmount(backendPriceUsd);

      setStarterpackDetails({
        source: "backend",
        id: String(starterpack),
        name: backendName,
        starterPackItems: backendItems,
        supply: backendSupply,
        mintAllowance: backendMintAllowance,
        merkleDrops: backendMerkleDrops,
        priceUsd: backendPriceUsd,
        acquisitionType: backendAcquisitionType,
      });
    } else if (source === "onchain" && onchainMetadata) {
      // Onchain flow (new) - show metadata as soon as it's available
      const purchaseItems: Item[] = onchainMetadata.items.map((item) => {
        // TODO: Calculate price per item if needed
        return {
          title: item.name,
          subtitle: item.description,
          icon: item.imageUri,
          value: 0, // Will be calculated from quote
          type: ItemType.NFT,
        };
      });

      // Convert total cost from USDC (6 decimals) to USD if quote is available
      const totalUsd = onchainQuote ? usdcToUsd(onchainQuote.totalCost) : 0;

      setPurchaseItems(purchaseItems);
      setUsdAmount(totalUsd);

      setStarterpackDetails({
        source: "onchain",
        id: Number(starterpack),
        name: onchainMetadata.name,
        description: onchainMetadata.description,
        imageUri: onchainMetadata.imageUri,
        items: onchainMetadata.items,
        quote: onchainQuote,
        isQuoteLoading: isOnchainQuoteLoading,
        acquisitionType: "PAID" as StarterpackAcquisitionType.Paid,
      });
    }
  }, [
    starterpack,
    source,
    // Backend dependencies
    backendItems,
    backendPriceUsd,
    backendName,
    backendSupply,
    backendMintAllowance,
    backendMerkleDrops,
    backendAcquisitionType,
    // Onchain dependencies
    onchainMetadata,
    onchainQuote,
    isOnchainQuoteLoading,
  ]);

  useEffect(() => {
    setDisplayError(
      stripeError ||
        walletError ||
        cryptoError ||
        starterpackError ||
        undefined,
    );
  }, [stripeError, walletError, cryptoError, starterpackError]);

  const clearError = useCallback(() => {
    setDisplayError(undefined);
  }, []);

  const clearSelectedWallet = useCallback(() => {
    setSelectedWallet(undefined);
  }, []);

  const onCreditCardPurchase = useCallback(async () => {
    if (!controller) return;

    try {
      setPaymentMethod("stripe");
      const paymentIntent = await createPaymentIntent(
        usdToCredits(usdAmount),
        controller.username(),
        undefined,
        typeof starterpack == "string" ? starterpack : undefined,
      );
      setClientSecret(paymentIntent.clientSecret);
      setCostDetails(paymentIntent.pricing);
    } catch (e) {
      setDisplayError(e as Error);
      throw e;
    }
  }, [usdAmount, controller, starterpack, createPaymentIntent]);

  const onBackendCryptoPurchase = useCallback(async () => {
    if (
      !controller ||
      !selectedPlatform ||
      !walletAddress ||
      !walletType ||
      !layerswapFees ||
      !swapInput
    )
      return;

    try {
      setPaymentMethod("crypto");

      swapInput.layerswapFees = layerswapFees;

      // Use existing payment method
      const { paymentId, transactionHash } = await sendPayment(
        swapInput,
        walletAddress,
        walletType,
        selectedPlatform,
        (explorer) => {
          setExplorer(explorer);
        },
      );
      setPaymentId(paymentId);
      setTransactionHash(transactionHash);
    } catch (e) {
      setDisplayError(e as Error);
      throw e;
    }
  }, [
    controller,
    selectedPlatform,
    walletAddress,
    walletType,
    swapInput,
    layerswapFees,
    sendPayment,
  ]);

  const onOnchainPurchase = useCallback(async () => {
    if (!controller || !starterpackDetails) return;

    if (!isOnchainStarterpack(starterpackDetails)) {
      throw new Error("Not an onchain starterpack");
    }

    const { quote, id: starterpackId } = starterpackDetails;

    if (!quote) {
      throw new Error("Quote not loaded yet");
    }

    try {
      const registryContract = import.meta.env
        .VITE_STARTERPACK_REGISTRY_CONTRACT;
      const recipient = controller.address();

      // Determine wallet type for execution
      const walletType =
        selectedWallet?.type === "argent" || selectedWallet?.type === "braavos"
          ? selectedWallet.type
          : "controller";

      // Check if we need to swap tokens (selected token is different from payment token)
      const needsSwap =
        selectedToken &&
        num.toHex(selectedToken.address) !== num.toHex(quote.paymentToken);

      // Build all transaction calls
      let allCalls: Call[] = [];

      // Step 0: Add swap calls if needed (swap from selectedToken to paymentToken)
      if (needsSwap && selectedToken) {
        try {
          if (!swapQuote) {
            throw new Error("No swap quote found");
          }

          const network = chainIdToEkuboNetwork(controller.chainId());

          // Generate swap calls
          // swapQuote.total is the amount of selectedToken we need to spend
          const routerAddress = EKUBO_ROUTER_ADDRESSES[network];
          const swapAmount =
            swapQuote.total < 0n ? -swapQuote.total : swapQuote.total;
          const doubledTotal = swapAmount * 2n;
          const totalQuoteSum =
            doubledTotal < swapAmount + BigInt(1e19)
              ? doubledTotal
              : swapAmount + BigInt(1e19);

          // Step 0a: Approve selected token for router
          const approveSelectedTokenAmount = uint256.bnToUint256(totalQuoteSum);
          const approveSelectedTokenCall: Call = {
            contractAddress: selectedToken.address,
            entrypoint: "approve",
            calldata: [
              routerAddress, // spender
              approveSelectedTokenAmount.low,
              approveSelectedTokenAmount.high,
            ],
          };

          // Generate swap calls (includes transfer + clear calls)
          const swapCallsWithoutApprove = generateSwapCalls(
            selectedToken.address, // purchaseToken (selected token)
            quote.paymentToken, // targetToken (payment token)
            quote.totalCost, // minimumAmount (minimum payment token to receive)
            swapQuote,
            network,
          );

          // Add swap calls to the beginning
          allCalls = [approveSelectedTokenCall, ...swapCallsWithoutApprove];
        } catch (error) {
          console.error("Failed to generate swap calls:", error);
          throw new Error(
            `Failed to prepare swap: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }

      // Convert totalCost to u256 (low, high)
      const amount256 = uint256.bnToUint256(quote.totalCost);

      // Step 1: Approve payment token for the exact transfer amount
      const approvePaymentTokenCall: Call = {
        contractAddress: quote.paymentToken,
        entrypoint: "approve",
        calldata: [
          registryContract, // spender
          amount256.low, // amount low
          amount256.high, // amount high
        ],
      };

      // Get referral data for the current game
      const referralData = getCurrentReferral(origin);

      // Step 2: Issue the starterpack
      // issue(recipient, starterpack_id, quantity, referrer: Option<ContractAddress>, referrer_group: Option<felt252>)
      const issueCall: Call = {
        contractAddress: registryContract,
        entrypoint: "issue",
        calldata: [
          recipient, // recipient
          starterpackId, // starterpack_id: u32
          0x1, // quantity: u32 (always 1 for now)
          ...(referralData?.refAddress
            ? [0x0, num.toHex(referralData.refAddress)]
            : [0x1]),
          ...(referralData?.refGroup
            ? [0x0, num.toHex(cairo.felt(referralData.refGroup))]
            : [0x1]),
        ],
      };

      // Combine all calls: [swap calls (if needed)] + approve payment token + issue
      allCalls = [...allCalls, approvePaymentTokenCall, issueCall];

      // Execute all calls in a single multicall using appropriate wallet
      let purchaseTransactionHash: string;

      if (walletType === "controller") {
        const result = await controller.execute(allCalls);
        purchaseTransactionHash = result.transaction_hash;
      } else {
        // Use external wallet - convert calls to snake_case format expected by Argent/Braavos
        if (!externalSendTransaction) {
          throw new Error(
            "externalSendTransaction is required for external wallet type",
          );
        }

        // Convert Call[] to format expected by external wallets (snake_case)
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
    externalSendTransaction,
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
        setWalletType(wallet.type);

        if (chainId) {
          // WORKAROUND: Braavos doesn't support switching chains api so we remain on whatever chain is current
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
    [controller, connectWallet, switchChain],
  );

  const fetchFees = useCallback(async () => {
    if (!swapInput) return;

    try {
      setIsFetchingFees(true);

      const quote = await estimateStarterPackFees(swapInput);
      const amountInCents = usdAmount / 1e4;
      const cartridgeFees = amountInCents * CARTRIDGE_FEE;
      const layerswapFeesInCents = Number(quote.totalFees) / 1e4;
      const totalFeesInCents = cartridgeFees + layerswapFeesInCents;
      const totalInCents = amountInCents + totalFeesInCents;

      setLayerswapFees(quote.totalFees);
      setCostDetails({
        baseCostInCents: amountInCents,
        processingFeeInCents: cartridgeFees + layerswapFeesInCents,
        totalInCents,
      });
    } catch (e) {
      setDisplayError(e as Error);
      throw e;
    } finally {
      setIsFetchingFees(false);
    }
  }, [swapInput, usdAmount, estimateStarterPackFees]);

  const contextValue: PurchaseContextType = {
    // Purchase details
    usdAmount,
    starterpackDetails,
    purchaseItems,
    claimItems,
    layerswapFees,
    isFetchingFees,

    // Payment state
    paymentMethod,
    selectedWallet,
    selectedPlatform,
    walletAddress,
    transactionHash,
    paymentId,
    explorer,
    ethereumPrivateKey,

    // Stripe state
    clientSecret,
    costDetails,
    stripePromise,

    // Loading states
    isStripeLoading,
    isCryptoLoading,
    isStarterpackLoading,

    // Error state
    displayError,
    clearError,

    // Wallet management
    clearSelectedWallet,

    // Token selection (for onchain purchases)
    availableTokens,
    selectedToken,
    setSelectedToken,
    convertedPrice,
    swapQuote,
    isFetchingConversion,
    conversionError,

    // Setters
    setUsdAmount,
    setPurchaseItems,
    setClaimItems,
    setStarterpack,
    setTransactionHash,
    setEthereumPrivateKey,

    // Actions
    onCreditCardPurchase,
    onBackendCryptoPurchase,
    onOnchainPurchase,
    onExternalConnect,
    waitForPayment,
    fetchFees,
  };

  return (
    <PurchaseContext.Provider value={contextValue}>
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchaseContext = () => {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error("usePurchaseContext must be used within PurchaseProvider");
  }
  return context;
};
