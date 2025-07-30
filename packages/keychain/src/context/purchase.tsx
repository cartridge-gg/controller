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

// Types
export type PurchaseType = "credits" | "starterpack";
export type PaymentMethodType = "controller" | "stripe" | "crypto";

export interface CostDetails {
  baseCostInCents: number;
  processingFeeInCents: number;
  totalInCents: number;
}

export interface StarterPackDetails {
  id: string;
  name: string;
  priceUsd: number;
  starterPackItems: any[];
  mintAllowance?: any;
}

export interface Network {
  id: string;
  name: string;
  icon: React.ReactElement;
}

export interface PurchaseContextType {
  // Purchase details
  purchaseType: PurchaseType;
  amount: number;
  wholeCredits: number;
  starterpackId?: string;
  teamId?: string;

  // Payment state
  paymentMethod?: PaymentMethodType;
  selectedNetwork?: Network;
  selectedWallet?: ExternalWallet;
  walletAddress?: string;

  // Stripe state
  clientSecret?: string;
  costDetails?: CostDetails;
  stripePromise: any;

  // Loading states
  isStripeLoading: boolean;
  isLoadingWallets: boolean;
  isClaiming: boolean;

  // Error state
  displayError?: Error;

  // Actions
  setPurchaseType: (type: PurchaseType) => void;
  setAmount: (amount: number) => void;
  setWholeCredits: (credits: number) => void;
  setStarterpackId: (id: string) => void;
  setTeamId: (teamId?: string) => void;
  setPaymentMethod: (method?: PaymentMethodType) => void;
  setSelectedNetwork: (network?: Network) => void;
  setSelectedWallet: (wallet?: ExternalWallet) => void;
  setWalletAddress: (address?: string) => void;
  setClientSecret: (secret?: string) => void;
  setCostDetails: (cost?: CostDetails) => void;
  setDisplayError: (error?: Error) => void;

  // Payment actions
  onAmountChanged: (usdAmount: number) => void;
  onCreditCard: () => Promise<void>;
  onExternalConnect: (wallet: ExternalWallet) => Promise<void>;
  onCompletePurchase: () => void;

  // Utility
  clearState: () => void;
  closeModal: () => void;
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
  const { controller, closeModal } = useConnection();
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
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("credits");
  const [amount, setAmount] = useState<number>(USD_AMOUNTS[0]);
  const [wholeCredits, setWholeCredits] = useState<number>(
    usdToCredits(USD_AMOUNTS[0]),
  );
  const [starterpackId, setStarterpackId] = useState<string | undefined>();
  const [teamId, setTeamId] = useState<string | undefined>();

  const [paymentMethod, setPaymentMethod] = useState<
    PaymentMethodType | undefined
  >();
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

  // Actions
  const onAmountChanged = useCallback((usdAmount: number) => {
    setDisplayError(undefined);
    setAmount(usdAmount);
    setWholeCredits(usdToCredits(usdAmount));
  }, []);

  const onCreditCard = useCallback(async () => {
    if (!controller) return;

    try {
      const paymentIntent = await createPaymentIntent(
        wholeCredits,
        controller.username(),
        teamId,
        starterpackId,
      );
      setClientSecret(paymentIntent.clientSecret);
      setCostDetails(paymentIntent.pricing);
      setPaymentMethod("stripe");
    } catch (e) {
      setDisplayError(e as Error);
    }
  }, [
    wholeCredits,
    createPaymentIntent,
    controller,
    starterpackId,
    teamId,
  ]);

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
        setPaymentMethod("crypto");
      }
    },
    [connectWallet],
  );

  const onCompletePurchase = useCallback(() => {
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  const clearState = useCallback(() => {
    setPurchaseType("credits");
    setAmount(USD_AMOUNTS[0]);
    setWholeCredits(usdToCredits(USD_AMOUNTS[0]));
    setStarterpackId(undefined);
    setTeamId(undefined);
    setPaymentMethod(undefined);
    setSelectedNetwork(undefined);
    setSelectedWallet(undefined);
    setWalletAddress(undefined);
    setClientSecret(undefined);
    setCostDetails(undefined);
    setDisplayError(undefined);
  }, []);

  const contextValue: PurchaseContextType = {
    // Purchase details
    purchaseType,
    amount,
    wholeCredits,
    starterpackId,
    teamId,

    // Payment state
    paymentMethod,
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
    setPurchaseType,
    setAmount,
    setWholeCredits,
    setStarterpackId,
    setTeamId,
    setPaymentMethod,
    setSelectedNetwork,
    setSelectedWallet,
    setWalletAddress,
    setClientSecret,
    setCostDetails,
    setDisplayError,

    // Actions
    onAmountChanged,
    onCreditCard,
    onExternalConnect,
    onCompletePurchase,

    // Utility
    clearState,
    closeModal: closeModal || (() => {}),
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
