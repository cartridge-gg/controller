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
import { ConnectionContext } from "@/components/provider/connection";
import {
  StarterPack,
  StarterPackItem,
  calculateStarterPackPrice,
  aggregateStarterPackCalls,
  generateNonce,
  getDefaultExpiry,
} from "@/utils/starterpack";
import { StarterpackAcquisitionType } from "@cartridge/ui/utils/api/cartridge";

interface StarterPackContextData {
  starterPackData: {
    starterPack: StarterPack;
    starterpackId: string;
  };
}
import useStripePayment from "@/hooks/payments/stripe";
import { usdToCredits } from "@/hooks/tokens";
import { USD_AMOUNTS } from "@/components/funding/AmountSelection";
import { Stripe } from "@stripe/stripe-js";
import { useWallets } from "@/hooks/wallets";
import { Explorer, useCryptoPayment } from "@/hooks/payments/crypto";
import {
  StarterPackDetails,
  useStarterPack,
  StarterItemType,
} from "@/hooks/starterpack";

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
  starterpackDetails?: StarterPackDetails;

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

  // Actions
  setUsdAmount: (amount: number) => void;
  setPurchaseItems: (items: Item[]) => void;
  setClaimItems: (items: Item[]) => void;
  setStarterpackId: (id: string) => void;
  setTransactionHash: (hash: string) => void;

  // Payment actions
  onCreditCardPurchase: () => Promise<void>;
  onCryptoPurchase: () => Promise<void>;
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
  const { controller } = useConnection();
  const connectionContext = useContext(ConnectionContext);
  const { error: walletError, connectWallet, switchChain } = useWallets();
  const [starterpackId, setStarterpackId] = useState<string | undefined>();
  const [starterpackDetails, setStarterpackDetails] = useState<
    StarterPackDetails | undefined
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
    quotePaymentFees,
    waitForPayment,
    createStarterPackPayment,
  } = useCryptoPayment();

  const {
    name,
    items,
    supply,
    mintAllowance,
    merkleDrops,
    priceUsd,
    acquisitionType,
    isLoading: isStarterpackLoading,
    error: starterpackError,
  } = useStarterPack(starterpackId);

  // Handle custom starterpack data from controller
  useEffect(() => {
    if (
      connectionContext?.context?.type === "open-starterpack-with-data" &&
      (connectionContext.context as StarterPackContextData).starterPackData
    ) {
      const data = connectionContext.context as StarterPackContextData;
      const { starterPack, starterpackId: customId } = data.starterPackData;

      setStarterpackId(customId);

      // Cast to get proper typing
      const typedStarterPack = starterPack as StarterPack;

      // Calculate total price from items
      const totalPrice = calculateStarterPackPrice(typedStarterPack);
      setUsdAmount(totalPrice);

      // Create items from the custom starterpack data
      const customPurchaseItems: Item[] =
        typedStarterPack.items?.map((item: StarterPackItem) => ({
          title: item.name,
          subtitle: item.description,
          icon: item.iconURL || "🎁",
          value: (item.price || 0) * (item.amount || 1),
          type: item.type === "NONFUNGIBLE" ? ItemType.NFT : ItemType.CREDIT,
        })) || [];

      setPurchaseItems(customPurchaseItems);

      // Create custom starter pack details
      setStarterpackDetails({
        id: customId,
        name: typedStarterPack.name,
        starterPackItems:
          typedStarterPack.items?.map((item: StarterPackItem) => ({
            title: item.name,
            description: item.description,
            image: item.iconURL || "",
            price: item.price || 0,
            type:
              item.type === "NONFUNGIBLE"
                ? StarterItemType.NFT
                : StarterItemType.CREDIT,
            contractAddress: item.call?.[0]?.contractAddress || "",
          })) || [],
        supply: 0, // Just a number, not an object
        mintAllowance: { count: 1, limit: 1 },
        merkleDrops: [],
        priceUsd: totalPrice,
        acquisitionType: StarterpackAcquisitionType.Paid,
      });

      return; // Skip the default useStarterPack logic
    }
  }, [
    connectionContext?.context?.type,
    (connectionContext?.context as StarterPackContextData | undefined)?.starterPackData,
  ]);

  useEffect(() => {
    if (!starterpackId) return;

    // Skip default logic if we have custom starterpack data
    if (
      connectionContext?.context?.type === "open-starterpack-with-data" &&
      (connectionContext.context as StarterPackContextData).starterPackData
    ) {
      return;
    }

    const purchaseItems: Item[] = items.map((item) => ({
      title: item.title,
      subtitle: item.description,
      icon: item.image,
      value: priceUsd,
      type: ItemType.NFT,
    }));

    setPurchaseItems(purchaseItems);
    setUsdAmount(priceUsd);

    setStarterpackDetails({
      id: starterpackId,
      name,
      starterPackItems: items,
      supply,
      mintAllowance,
      merkleDrops,
      priceUsd,
      acquisitionType,
    });
  }, [
    starterpackId,
    items,
    priceUsd,
    name,
    supply,
    mintAllowance,
    merkleDrops,
    acquisitionType,
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

  const onCreditCardPurchase = useCallback(async () => {
    if (!controller) return;

    try {
      setPaymentMethod("stripe");
      const paymentIntent = await createPaymentIntent(
        usdToCredits(usdAmount),
        controller.username(),
        undefined,
        starterpackId,
      );
      setClientSecret(paymentIntent.clientSecret);
      setCostDetails(paymentIntent.pricing);
    } catch (e) {
      setDisplayError(e as Error);
      throw e;
    }
  }, [usdAmount, controller, starterpackId, createPaymentIntent]);

  const onCryptoPurchase = useCallback(async () => {
    if (
      !controller ||
      !selectedPlatform ||
      !walletAddress ||
      !walletType ||
      !layerswapFees
    )
      return;

    try {
      setPaymentMethod("crypto");

      // Check if we have custom starterpack data
      if (
        connectionContext?.context?.type === "open-starterpack-with-data" &&
        (connectionContext.context as StarterPackContextData).starterPackData &&
        createStarterPackPayment
      ) {
        // Process custom starter pack data
        const data = (connectionContext.context as StarterPackContextData).starterPackData;
        const typedStarterPack = data.starterPack as StarterPack;

        // Calculate total price and aggregate calls
        const totalPrice = calculateStarterPackPrice(typedStarterPack);
        const multicall = aggregateStarterPackCalls(typedStarterPack);

        // Generate outside execution parameters
        const outsideExecution = {
          caller: "0x0", // Default caller
          nonce: generateNonce(),
          execute_after: 0,
          execute_before: getDefaultExpiry(),
          calls: multicall,
        };

        // Create payment with processed data
        const result = await createStarterPackPayment(
          controller.username(),
          selectedPlatform!,
          {
            starterpackId: data.starterpackId,
            starterPack: typedStarterPack,
            outsideExecution,
            totalPrice,
          },
          undefined,
          connectionContext.isMainnet || false,
        );
        setPaymentId(result.id);
      } else {
        // Use existing payment method
        const { paymentId, transactionHash } = await sendPayment(
          walletAddress,
          walletType,
          selectedPlatform,
          usdToCredits(usdAmount),
          undefined,
          starterpackId,
          layerswapFees,
          (explorer) => {
            setExplorer(explorer);
          },
        );
        setPaymentId(paymentId);
        setTransactionHash(transactionHash);
      }
    } catch (e) {
      setDisplayError(e as Error);
      throw e;
    }
  }, [
    usdAmount,
    controller,
    selectedPlatform,
    walletAddress,
    walletType,
    starterpackId,
    layerswapFees,
    sendPayment,
    connectionContext,
    createStarterPackPayment,
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
          const res = await switchChain(wallet.type, chainId.toString());
          if (!res) {
            const error = new Error(
              `${wallet.name} failed to switch chain (${chainId})`,
            );
            throw error;
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
    if (!controller || !selectedPlatform) return;
    try {
      setIsFetchingFees(true);

      const quote = await quotePaymentFees(
        controller.username(),
        selectedPlatform,
        usdToCredits(usdAmount),
        undefined,
        starterpackId,
      );

      const amountInCents = usdAmount * 100;
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
  }, [
    controller,
    usdAmount,
    starterpackId,
    selectedPlatform,
    quotePaymentFees,
  ]);

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

    // Setters
    setUsdAmount,
    setPurchaseItems,
    setClaimItems,
    setStarterpackId,
    setTransactionHash,

    // Actions
    onCreditCardPurchase,
    onCryptoPurchase,
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
