import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { ExternalWallet } from "@cartridge/controller";
import { useConnection } from "@/hooks/connection";
import { useWallets } from "@/hooks/wallets";
import useStripePayment from "@/hooks/payments/stripe";
import { usdToCredits } from "@/hooks/tokens";
import { USD_AMOUNTS } from "@/components/funding/AmountSelection";
import { Stripe } from "@stripe/stripe-js";

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

export enum PurchaseItemType {
  CREDIT = "CREDIT",
  ERC20 = "ERC20",
  NFT = "NFT",
}

export type PurchaseItem = {
  title: string;
  subtitle?: string;
  icon: string | React.ReactNode;
  value?: number;
  type: PurchaseItemType;
};

export type PaymentMethod = "stripe" | "crypto";

export interface PurchaseContextType {
  // Purchase details
  usdAmount: number;
  starterpackId?: string;
  teamId?: string;
  purchaseItems: PurchaseItem[];

  // Payment state
  selectedNetwork?: Network;
  selectedWallet?: ExternalWallet;
  walletAddress?: string;

  // Stripe state
  clientSecret?: string;
  costDetails?: CostDetails;
  stripePromise: Promise<Stripe | null>;

  // Loading states
  isStripeLoading: boolean;
  isLoadingWallets: boolean;
  isClaiming: boolean;

  // Error state
  displayError?: Error;

  // Actions
  setUsdAmount: (amount: number) => void;
  setSelectedNetwork: (network?: Network) => void;
  setSelectedWallet: (wallet?: ExternalWallet) => void;
  setPurchaseItems: (items: PurchaseItem[]) => void;
  setStarterpackId: (id: string) => void;

  // Payment actions
  onCreditCard: () => Promise<void>;
  onExternalConnect: (wallet: ExternalWallet) => Promise<void>;
  onCompletePurchase: () => void;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(
  undefined,
);

export interface PurchaseProviderProps {
  children: ReactNode;
  isSlot?: boolean;
  onComplete?: () => void;
}

export const PurchaseProvider = ({
  children,
  isSlot = false,
  onComplete,
}: PurchaseProviderProps) => {
  const { controller } = useConnection();
  const {
    isLoading: isLoadingWallets,
    error: walletError,
    connectWallet,
  } = useWallets();

  const {
    stripePromise,
    isLoading: isStripeLoading,
    error: stripeError,
    createPaymentIntent,
  } = useStripePayment({ isSlot });

  // State
  const [usdAmount, setUsdAmount] = useState<number>(USD_AMOUNTS[0]);
  const [starterpackId, setStarterpackId] = useState<string | undefined>();
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);

  const [selectedNetwork, setSelectedNetwork] = useState<Network | undefined>();
  const [selectedWallet, setSelectedWallet] = useState<
    ExternalWallet | undefined
  >();
  const [walletAddress, setWalletAddress] = useState<string | undefined>();

  const [clientSecret, setClientSecret] = useState<string | undefined>();
  const [costDetails, setCostDetails] = useState<CostDetails | undefined>();

  const [displayError, setDisplayError] = useState<Error | undefined>();
  const [isClaiming] = useState(false); // TODO: Connect to actual claiming state

  // Update error when wallet or stripe errors change
  useEffect(() => {
    setDisplayError(walletError || stripeError || undefined);
  }, [walletError, stripeError]);

  const onCreditCard = useCallback(async () => {
    if (!controller) return;

    try {
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
    }
  }, [usdAmount, createPaymentIntent, controller, starterpackId]);

  const onExternalConnect = useCallback(
    async (wallet: ExternalWallet) => {
      setDisplayError(undefined);
      setSelectedWallet(wallet);
      const res = await connectWallet(wallet.type);
      if (res?.success) {
        if (!res.account) {
          setDisplayError(
            new Error(
              `Connected to ${wallet.name} but no wallet address found`,
            ),
          );
          return;
        }
        setWalletAddress(res.account);
      }
    },
    [connectWallet],
  );

  const onCompletePurchase = useCallback(() => {
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  const contextValue: PurchaseContextType = {
    // Purchase details
    usdAmount,
    starterpackId,
    purchaseItems,

    // Payment state
    selectedNetwork,
    selectedWallet,
    walletAddress,

    // Stripe state
    clientSecret,
    costDetails,
    stripePromise,

    // Loading states
    isStripeLoading,
    isLoadingWallets,
    isClaiming,

    // Error state
    displayError,

    // Setters
    setUsdAmount,
    setStarterpackId,
    setSelectedNetwork,
    setSelectedWallet,
    setPurchaseItems,

    // Actions
    onCreditCard,
    onExternalConnect,
    onCompletePurchase,
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
