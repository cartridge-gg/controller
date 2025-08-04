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
import useStripePayment from "@/hooks/payments/stripe";
import { usdToCredits } from "@/hooks/tokens";
import { USD_AMOUNTS } from "@/components/funding/AmountSelection";
import { Stripe } from "@stripe/stripe-js";
import { useWallets } from "@/hooks/wallets";
import { Explorer, useCryptoPayment } from "@/hooks/payments/crypto";

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
  paymentMethod?: PaymentMethod;
  selectedWallet?: ExternalWallet;
  walletAddress?: string;
  wallets?: ExternalWallet[];
  paymentId?: string;
  explorer?: Explorer;

  // Stripe state
  clientSecret?: string;
  costDetails?: CostDetails;
  stripePromise: Promise<Stripe | null>;

  // Loading states
  isStripeLoading: boolean;
  isWalletConnecting: boolean;
  isCryptoLoading: boolean;

  // Error state
  displayError?: Error;

  // Actions
  setUsdAmount: (amount: number) => void;
  setPurchaseItems: (items: PurchaseItem[]) => void;
  setStarterpackId: (id: string) => void;

  // Payment actions
  onCreditCard: () => Promise<void>;
  onCrypto: () => Promise<void>;
  onExternalConnect: (wallet: ExternalWallet) => Promise<void>;
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
  const {
    wallets,
    error: walletError,
    isConnecting: isWalletConnecting,
    connectWallet,
  } = useWallets();

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
  } = useCryptoPayment();

  // State
  const [paymentMethod, setPaymentMethod] = useState<
    PaymentMethod | undefined
  >();
  const [usdAmount, setUsdAmount] = useState<number>(USD_AMOUNTS[0]);
  const [starterpackId, setStarterpackId] = useState<string | undefined>();
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [paymentId, setPaymentId] = useState<string | undefined>();
  const [explorer, setExplorer] = useState<Explorer | undefined>();

  const [walletAddress, setWalletAddress] = useState<string>();
  const [selectedWallet, setSelectedWallet] = useState<
    ExternalWallet | undefined
  >();

  const [clientSecret, setClientSecret] = useState<string | undefined>();
  const [costDetails, setCostDetails] = useState<CostDetails | undefined>();

  const [displayError, setDisplayError] = useState<Error | undefined>();

  useEffect(() => {
    setDisplayError(stripeError || walletError || cryptoError || undefined);
  }, [stripeError, walletError, cryptoError]);

  const onCreditCard = useCallback(async () => {
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
    }
  }, [usdAmount, controller, starterpackId, createPaymentIntent]);

  const onCrypto = useCallback(async () => {
    if (!controller || !selectedWallet?.platform || !walletAddress) return;

    setPaymentMethod("crypto");
    const paymentId = await sendPayment(
      walletAddress,
      usdToCredits(usdAmount),
      selectedWallet.platform,
      undefined,
      starterpackId,
      (explorer) => {
        setExplorer(explorer);
      },
    );
    setPaymentId(paymentId);
  }, [controller, selectedWallet, walletAddress, starterpackId, sendPayment]);

  const onExternalConnect = useCallback(
    async (wallet: ExternalWallet) => {
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

  const contextValue: PurchaseContextType = {
    // Purchase details
    usdAmount,
    starterpackId,
    purchaseItems,

    // Payment state
    paymentMethod,
    selectedWallet,
    walletAddress,
    wallets,
    paymentId,
    explorer,

    // Stripe state
    clientSecret,
    costDetails,
    stripePromise,

    // Loading states
    isStripeLoading,
    isWalletConnecting,
    isCryptoLoading,

    // Error state
    displayError,

    // Setters
    setUsdAmount,
    setStarterpackId,
    setPurchaseItems,

    // Actions
    onCreditCard,
    onCrypto,
    onExternalConnect,
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
