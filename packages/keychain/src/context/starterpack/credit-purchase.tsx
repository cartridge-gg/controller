import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { useConnection } from "@/hooks/connection";
import useCoinflowPayment, {
  CoinflowStarterpackIntent,
  CoinflowStarterpackQuote,
  useCoinflowStarterpackQuote,
} from "@/hooks/payments/coinflow";
import { USD_AMOUNTS } from "@/components/funding/AmountSelection";
import { useStarterpackContext } from "./starterpack";
import { useOnchainPurchaseContext } from "./onchain-purchase";
import { getCurrentReferral } from "@/utils/referral";
import { isOnchainStarterpack } from "./types";

export interface CreditPurchaseContextType {
  // USD amount selection
  usdAmount: number;
  setUsdAmount: (amount: number) => void;

  // Coinflow state
  coinflowIntent: CoinflowStarterpackIntent | undefined;
  coinflowQuote: CoinflowStarterpackQuote | undefined;
  isCoinflowQuoteLoading: boolean;
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
}

export const CreditPurchaseProvider = ({
  children,
}: CreditPurchaseProviderProps) => {
  const { controller, origin } = useConnection();
  const {
    registryAddress,
    bundleId,
    starterpackId,
    starterpackDetails,
    setDisplayError,
  } = useStarterpackContext();
  const { quantity } = useOnchainPurchaseContext();

  const [usdAmount, setUsdAmount] = useState<number>(USD_AMOUNTS[0]);
  const [coinflowIntent, setCoinflowIntent] = useState<
    CoinflowStarterpackIntent | undefined
  >();

  const {
    isLoading: isCoinflowLoading,
    error: coinflowError,
    createIntent: createCoinflowIntent,
    env: coinflowEnv,
  } = useCoinflowPayment();

  // Auto-fetch the Coinflow pricing quote whenever the relevant inputs change.
  // The hook handles its own enabled/disabled state and Ekubo swap pricing
  // for non-USDC starterpacks via the backend coinflowStarterpackQuote query.
  const referralData = getCurrentReferral(origin);
  const isOnchain =
    !!starterpackDetails && isOnchainStarterpack(starterpackDetails);
  const { data: coinflowQuote, isLoading: isCoinflowQuoteLoading } =
    useCoinflowStarterpackQuote({
      starterpackId: isOnchain
        ? (starterpackDetails as { id: number | string }).id.toString()
        : undefined,
      quantity,
      registryAddress,
      referral: referralData?.refAddress || referralData?.ref,
      referralGroup: referralData?.refGroup,
      ...(bundleId !== undefined && { clientPercentage: 0 }),
      enabled: isOnchain,
    });

  useEffect(() => {
    if (coinflowError) {
      setDisplayError(coinflowError);
    }
  }, [coinflowError]); // eslint-disable-line react-hooks/exhaustive-deps

  const onCreditCardPurchase = useCallback(async () => {
    if (!controller || !registryAddress) return;
    if (!starterpackDetails || !isOnchainStarterpack(starterpackDetails)) {
      return;
    }

    try {
      if (!starterpackDetails.quote) {
        throw new Error("Quote not loaded yet");
      }

      const referralData = getCurrentReferral(origin);

      const intent = await createCoinflowIntent({
        starterpackId: starterpackDetails.id.toString(),
        quantity,
        referral: referralData?.refAddress || referralData?.ref,
        referralGroup: referralData?.refGroup,
        registryAddress,
        ...(bundleId !== undefined && { clientPercentage: 0 }),
      });
      setCoinflowIntent(intent);
    } catch (e) {
      setDisplayError(e as Error);
      throw e;
    }
  }, [
    controller,
    origin,
    registryAddress,
    bundleId,
    starterpackDetails,
    quantity,
    createCoinflowIntent,
    setDisplayError,
  ]);

  useEffect(() => {
    setCoinflowIntent(undefined);
  }, [starterpackId]);

  const contextValue: CreditPurchaseContextType = {
    usdAmount,
    setUsdAmount,
    coinflowIntent,
    coinflowQuote,
    isCoinflowQuoteLoading,
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
