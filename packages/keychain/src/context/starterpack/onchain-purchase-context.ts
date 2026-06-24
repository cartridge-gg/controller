import { createContext, ReactNode } from "react";
import { ExternalPlatform, ExternalWallet } from "@cartridge/controller";
import { CoinbaseOnrampStatus } from "@/utils/api";
import { SubmitCoinbaseLimitsUpgradeInput } from "@/utils/api";
import { Explorer } from "@/hooks/starterpack/layerswap";
import {
  COINBASE_APPLE_PAY_MIN_USD,
  type TokenOption,
  type CoinbaseOrderResult,
  type CoinbaseTransactionResult,
  type CoinbaseQuoteResult,
  type CoinbaseLimitsResult,
} from "@/hooks/starterpack";
import { SwapQuote } from "@/utils/ekubo";
import { Item } from "./types";

export type { TokenOption } from "@/hooks/starterpack";
export { COINBASE_APPLE_PAY_MIN_USD };

export interface OnchainPurchaseContextType {
  // Purchase items
  purchaseItems: Item[];
  purchaseDescription: string | undefined;

  // Quantity management
  quantity: number;
  incrementQuantity: () => void;
  decrementQuantity: () => void;

  // Conditional bundles / social claim
  setIssueSignature: (signature: string[] | undefined) => void;

  // Wallet state
  selectedWallet: ExternalWallet | undefined;
  selectedPlatform: ExternalPlatform | undefined;
  walletAddress: string | undefined;
  clearSelectedWallet: () => void;

  // Token selection
  availableTokens: TokenOption[];
  selectedToken: TokenOption | undefined;
  setSelectedToken: (token: TokenOption | undefined) => void;
  convertedPrice: {
    amount: bigint;
    quantity: number;
    tokenMetadata: { symbol: string; decimals: number };
  } | null;
  swapQuote: SwapQuote | null;
  isFetchingConversion: boolean;
  isTokenSelectionLocked: boolean;
  conversionError: Error | null;

  // USD amount (derived from quote)
  usdAmount: number;

  // Layerswap state (for future use)
  layerswapFees: string | undefined;
  isFetchingFees: boolean;
  isSendingDeposit: boolean;
  swapId: string | undefined;
  explorer: Explorer | undefined;
  requestedAmount: number | undefined;
  depositAmount: number | undefined; // Computed: requestedAmount + fees
  setRequestedAmount: (amount: number) => void;
  feeEstimationError: Error | null;

  // Coinbase / Apple Pay state
  isApplePaySelected: boolean;
  isCoinflowSelected: boolean;
  paymentLink: string | undefined;
  isCreatingOrder: boolean;
  coinbaseQuote: CoinbaseQuoteResult | undefined;
  isFetchingCoinbaseQuote: boolean;
  orderId: string | undefined;
  orderStatus: CoinbaseOnrampStatus | undefined;
  orderTxHash: string | undefined;
  popupClosed: boolean;
  paymentSuccess: boolean;
  coinbaseLsSwapId: string | undefined;
  /** Quantity we auto-bumped to so Apple Pay's per-transaction minimum is met. Undefined when no bump is active. */
  applePayMinQuantity: number | undefined;

  // Coinbase limits-upgrade state
  coinbaseLimits: CoinbaseLimitsResult | undefined;
  isFetchingCoinbaseLimits: boolean;
  isSubmittingLimitsUpgrade: boolean;

  // Actions
  onOnchainPurchase: () => Promise<void>;
  onExternalConnect: (
    wallet: ExternalWallet,
    platform: ExternalPlatform,
    chainId?: string,
  ) => Promise<string | undefined>;
  onSendDeposit: () => Promise<void>;
  waitForDeposit: (swapId: string) => Promise<string>;
  onApplePaySelect: () => void;
  onCoinflowSelect: () => void;
  onCreateCoinbaseOrder: (opts?: {
    force?: boolean;
  }) => Promise<CoinbaseOrderResult | undefined>;
  openPaymentPopup: (opts?: {
    paymentLink?: string;
    orderId?: string;
    preOpenedPopup?: Window | null;
  }) => void;
  closePaymentPopup: () => void;
  resetCoinbasePurchase: () => void;
  getTransactions: (username: string) => Promise<CoinbaseTransactionResult[]>;
  fetchCoinbaseLimits: () => Promise<CoinbaseLimitsResult | undefined>;
  submitCoinbaseLimitsUpgrade: (
    input: SubmitCoinbaseLimitsUpgradeInput,
  ) => Promise<CoinbaseLimitsResult | undefined>;
}

export const OnchainPurchaseContext = createContext<
  OnchainPurchaseContextType | undefined
>(undefined);

export interface OnchainPurchaseProviderProps {
  children: ReactNode;
}
