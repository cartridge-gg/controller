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
import useCoinflowPayment, {
  CoinflowOrderResponse,
} from "@/hooks/payments/coinflow";
import { usdToCredits } from "@/hooks/tokens";
import { USD_AMOUNTS } from "@/components/funding/AmountSelection";
import { Stripe } from "@stripe/stripe-js";
import { useStarterpackContext } from "./starterpack";
import { useOnchainPurchaseContext } from "./onchain-purchase";
import { isOnchainStarterpack } from "./types";

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
  stripePaymentId: string | undefined;
  clientSecret: string | undefined;
  customerSessionClientSecret: string | undefined;
  costDetails: CostDetails | undefined;
  stripePromise: Promise<Stripe | null>;
  isStripeLoading: boolean;

  // Coinflow state
  coinflowOrder: CoinflowOrderResponse | undefined;
  coinflowEnv: "prod" | "sandbox";
  isCoinflowLoading: boolean;

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
  const {
    registryAddress,
    starterpackId,
    starterpackDetails,
    setDisplayError,
  } = useStarterpackContext();
  const { quantity } = useOnchainPurchaseContext();

  const [usdAmount, setUsdAmount] = useState<number>(USD_AMOUNTS[0]);
  const [stripePaymentId, setStripePaymentId] = useState<string | undefined>();
  const [clientSecret, setClientSecret] = useState<string | undefined>();
  const [customerSessionClientSecret, setCustomerSessionClientSecret] =
    useState<string | undefined>();
  const [costDetails, setCostDetails] = useState<CostDetails | undefined>();
  const [coinflowOrder, setCoinflowOrder] = useState<
    CoinflowOrderResponse | undefined
  >();

  const {
    stripePromise,
    isLoading: isStripeLoading,
    error: stripeError,
    createPaymentIntent,
  } = useStripePayment({ isSlot });

  const {
    isLoading: isCoinflowLoading,
    error: coinflowError,
    createOrder: createCoinflowOrder,
    env: coinflowEnv,
  } = useCoinflowPayment();

  // Sync payment errors
  useEffect(() => {
    if (stripeError) {
      setDisplayError(stripeError);
    }
  }, [stripeError]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (coinflowError) {
      setDisplayError(coinflowError);
    }
  }, [coinflowError]); // eslint-disable-line react-hooks/exhaustive-deps

  const onCreditCardPurchase = useCallback(async () => {
    if (!controller || !registryAddress) return;

    try {
      if (starterpackDetails && isOnchainStarterpack(starterpackDetails)) {
        const starterpackQuote = starterpackDetails.quote;

        if (!starterpackQuote) {
          throw new Error("Quote not loaded yet");
        }

        // Convert quote total cost from base units to USDC amount string
        // Quote totalCost is in payment token base units (6 decimals for USDC)
        const totalCostUsdc = (
          Number(starterpackQuote.totalCost * BigInt(quantity)) / 1e6
        ).toFixed(6);

        const order = await createCoinflowOrder(totalCostUsdc);
        setCoinflowOrder(order);
      } else {
        const paymentIntent = await createPaymentIntent(
          usdToCredits(usdAmount),
          undefined,
          typeof starterpackId === "string" ? starterpackId : undefined,
        );

        setStripePaymentId(paymentIntent.id);
        setClientSecret(paymentIntent.clientSecret);
        setCustomerSessionClientSecret(
          paymentIntent.customerSessionClientSecret ?? undefined,
        );
        setCostDetails(paymentIntent.pricing);
      }
    } catch (e) {
      setDisplayError(e as Error);
      throw e;
    }
  }, [
    usdAmount,
    controller,
    registryAddress,
    starterpackId,
    starterpackDetails,
    quantity,
    createPaymentIntent,
    createCoinflowOrder,
    setDisplayError,
  ]);

  useEffect(() => {
    setStripePaymentId(undefined);
    setClientSecret(undefined);
    setCustomerSessionClientSecret(undefined);
    setCostDetails(undefined);
    setCoinflowOrder(undefined);
  }, [starterpackId]);

  const contextValue: CreditPurchaseContextType = {
    usdAmount,
    setUsdAmount,
    stripePaymentId,
    clientSecret,
    customerSessionClientSecret,
    costDetails,
    stripePromise,
    isStripeLoading,
    coinflowOrder,
    coinflowEnv,
    isCoinflowLoading,
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
