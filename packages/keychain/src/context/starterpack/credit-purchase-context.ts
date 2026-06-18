import { createContext, ReactNode } from "react";
import {
  CoinflowStarterpackIntent,
  CoinflowStarterpackQuote,
} from "@/hooks/payments/coinflow";

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
