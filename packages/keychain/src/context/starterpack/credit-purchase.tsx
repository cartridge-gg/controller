import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { useConnection } from "@/hooks/connection";
import useStripePayment from "@/hooks/payments/stripe";
import { usdToCredits } from "@/hooks/tokens";
import { USD_AMOUNTS } from "@/components/funding/AmountSelection";
import { Stripe } from "@stripe/stripe-js";
import { useStarterpackContext } from "./starterpack";

export interface CostDetails {
  baseCostInCents: number;
  processingFeeInCents: number;
  totalInCents: number;
}

export interface CreditPurchaseContextType {
  // USD amount selection
  usdAmount: number;
  setUsdAmount: (amount: number) => void;

  // Stripe state
  clientSecret: string | undefined;
  costDetails: CostDetails | undefined;
  stripePromise: Promise<Stripe | null>;
  isStripeLoading: boolean;

  // Actions
  onCreditCardPurchase: () => Promise<void>;
}

export const CreditPurchaseContext = createContext<
  CreditPurchaseContextType | undefined
>(undefined);

export interface CreditPurchaseProviderProps {
  children: ReactNode;
  isSlot?: boolean;
}

export const CreditPurchaseProvider = ({
  children,
  isSlot = false,
}: CreditPurchaseProviderProps) => {
  const { controller } = useConnection();
  const { starterpackId, setDisplayError } = useStarterpackContext();

  const [usdAmount, setUsdAmount] = useState<number>(USD_AMOUNTS[0]);
  const [clientSecret, setClientSecret] = useState<string | undefined>();
  const [costDetails, setCostDetails] = useState<CostDetails | undefined>();

  const {
    stripePromise,
    isLoading: isStripeLoading,
    error: stripeError,
    createPaymentIntent,
  } = useStripePayment({ isSlot });

  // Sync stripe error
  useEffect(() => {
    if (stripeError) {
      setDisplayError(stripeError);
    }
  }, [stripeError]); // eslint-disable-line react-hooks/exhaustive-deps

  const onCreditCardPurchase = useCallback(async () => {
    if (!controller) return;

    try {
      const paymentIntent = await createPaymentIntent(
        usdToCredits(usdAmount),
        controller.username(),
        undefined,
        typeof starterpackId === "string" ? starterpackId : undefined,
      );
      setClientSecret(paymentIntent.clientSecret);
      setCostDetails(paymentIntent.pricing);
    } catch (e) {
      setDisplayError(e as Error);
      throw e;
    }
  }, [
    usdAmount,
    controller,
    starterpackId,
    createPaymentIntent,
    setDisplayError,
  ]);

  const contextValue: CreditPurchaseContextType = {
    usdAmount,
    setUsdAmount,
    clientSecret,
    costDetails,
    stripePromise,
    isStripeLoading,
    onCreditCardPurchase,
  };

  return (
    <CreditPurchaseContext.Provider value={contextValue}>
      {children}
    </CreditPurchaseContext.Provider>
  );
};

export const useCreditPurchaseContext = () => {
  const context = useContext(CreditPurchaseContext);
  if (!context) {
    throw new Error(
      "useCreditPurchaseContext must be used within CreditPurchaseProvider",
    );
  }
  return context;
};
