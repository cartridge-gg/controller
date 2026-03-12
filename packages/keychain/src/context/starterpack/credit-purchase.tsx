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
import { useOnchainPurchaseContext } from "./onchain-purchase";
import { getCurrentReferral } from "@/utils/referral";
import { isOnchainStarterpack } from "./types";
import { USDC_ADDRESSES } from "@/utils/ekubo";
import { num } from "starknet";
import { getStarterpackStripeCostDetails } from "@/components/purchasenew/review/stripe-pricing";

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
  const { controller, origin } = useConnection();
  const { starterpackId, starterpackDetails, setDisplayError } =
    useStarterpackContext();
  const { quantity } = useOnchainPurchaseContext();

  const [usdAmount, setUsdAmount] = useState<number>(USD_AMOUNTS[0]);
  const [stripePaymentId, setStripePaymentId] = useState<string | undefined>();
  const [clientSecret, setClientSecret] = useState<string | undefined>();
  const [costDetails, setCostDetails] = useState<CostDetails | undefined>();

  const {
    stripePromise,
    isLoading: isStripeLoading,
    error: stripeError,
    createPaymentIntent,
    createStarterpackPaymentIntent,
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
      let paymentIntent;

      if (starterpackDetails && isOnchainStarterpack(starterpackDetails)) {
        const starterpackQuote = starterpackDetails.quote;

        if (!starterpackQuote) {
          throw new Error("Quote not loaded yet");
        }

        const usdcAddress = USDC_ADDRESSES[controller.chainId()];
        if (
          !usdcAddress ||
          num.toHex(starterpackQuote.paymentToken) !== num.toHex(usdcAddress)
        ) {
          throw new Error(
            "Stripe checkout is only available for starterpacks priced in USDC.",
          );
        }

        const referralData = getCurrentReferral(origin);

        paymentIntent = await createStarterpackPaymentIntent({
          starterpackId: starterpackDetails.id.toString(),
          quantity,
          referral: referralData?.refAddress || referralData?.ref,
          referralGroup: referralData?.refGroup,
          registryAddress: num.toHex(
            import.meta.env.VITE_STARTERPACK_REGISTRY_CONTRACT,
          ),
        });
      } else {
        paymentIntent = await createPaymentIntent(
          usdToCredits(usdAmount),
          undefined,
          typeof starterpackId === "string" ? starterpackId : undefined,
        );
      }

      setStripePaymentId(paymentIntent.id);
      setClientSecret(paymentIntent.clientSecret);
      setCostDetails(
        starterpackDetails && isOnchainStarterpack(starterpackDetails)
          ? getStarterpackStripeCostDetails(starterpackDetails.quote!, quantity)
          : paymentIntent.pricing,
      );
    } catch (e) {
      setDisplayError(e as Error);
      throw e;
    }
  }, [
    usdAmount,
    controller,
    origin,
    starterpackId,
    starterpackDetails,
    quantity,
    createPaymentIntent,
    createStarterpackPaymentIntent,
    setDisplayError,
  ]);

  useEffect(() => {
    setStripePaymentId(undefined);
    setClientSecret(undefined);
    setCostDetails(undefined);
  }, [starterpackId]);

  const contextValue: CreditPurchaseContextType = {
    usdAmount,
    setUsdAmount,
    stripePaymentId,
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
