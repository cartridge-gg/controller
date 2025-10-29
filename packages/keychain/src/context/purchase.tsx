import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
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
  shortString,
  CairoOption,
  CairoOptionVariant,
} from "starknet";
import { isOnchainStarterpack } from "@/types/starterpack-types";
import { getCurrentReferral, lookupReferrerAddress } from "@/utils/referral";

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

  // Actions
  setUsdAmount: (amount: number) => void;
  setPurchaseItems: (items: Item[]) => void;
  setClaimItems: (items: Item[]) => void;
  setStarterpack: (starterpack: string | number) => void;
  setTransactionHash: (hash: string) => void;

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
  const { controller, isMainnet, origin } = useConnection();
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
  } = useStarterPack(source === "backend" ? String(starterpack) : undefined);

  // Onchain hook (Smart contract) - only run if onchain source
  const {
    metadata: onchainMetadata,
    quote: onchainQuote,
    isLoading: isOnchainLoading,
    isQuoteLoading: isOnchainQuoteLoading,
    error: onchainError,
  } = useStarterPackOnchain(
    source === "onchain" ? Number(starterpack) : undefined,
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
  }, [controller, starterpack, selectedPlatform, isMainnet, source]);

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

      // Convert totalCost to u256 (low, high)
      const amount256 = uint256.bnToUint256(quote.totalCost);

      // Step 1: Approve payment token for the exact transfer amount
      const approveCalls: Call[] = [
        {
          contractAddress: quote.paymentToken,
          entrypoint: "approve",
          calldata: [
            registryContract, // spender
            amount256.low, // amount low
            amount256.high, // amount high
          ],
        },
      ];

      // Get referral data for the current game
      const referralData = getCurrentReferral(origin);
      let referrerOption = new CairoOption(CairoOptionVariant.None);
      let referrerGroupOption = new CairoOption(CairoOptionVariant.None);

      if (referralData) {
        // Look up referrer's contract address
        const referrerAddress = await lookupReferrerAddress(referralData.ref);

        if (referrerAddress) {
          referrerOption = new CairoOption(
            CairoOptionVariant.Some,
            referrerAddress,
          );
        }

        // Encode referrer group as felt252 if present
        if (referralData.refGroup) {
          try {
            const refGroupFelt = shortString.encodeShortString(
              referralData.refGroup,
            );
            referrerGroupOption = new CairoOption(
              CairoOptionVariant.Some,
              refGroupFelt,
            );
          } catch (error) {
            console.error("[Purchase] Failed to encode referrer group:", error);
          }
        }
      }

      // Step 2: Issue the starterpack
      // issue(recipient, starterpack_id, quantity, referrer: Option<ContractAddress>, referrer_group: Option<felt252>)
      const issueCalls: Call[] = [
        {
          contractAddress: registryContract,
          entrypoint: "issue",
          calldata: [
            recipient, // recipient
            starterpackId, // starterpack_id: u32
            0x1, // quantity: u32 (always 1 for now)
            referrerOption, // referrer: Option<ContractAddress>
            referrerGroupOption, // referrer_group: Option<felt252>
          ],
        },
      ];

      // Execute both calls in sequence
      const calls = [...approveCalls, ...issueCalls];
      const result = await controller.execute(calls);

      // Store transaction hash
      setTransactionHash(result.transaction_hash);
    } catch (e) {
      setDisplayError(e as Error);
      throw e;
    }
  }, [controller, starterpackDetails, origin]);

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

    // Setters
    setUsdAmount,
    setPurchaseItems,
    setClaimItems,
    setStarterpack,
    setTransactionHash,

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
