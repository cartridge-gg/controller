import { ExternalWallet } from "@cartridge/controller";
import { PurchaseType } from "@/hooks/payments/crypto";
import { StarterPackDetails } from "@/hooks/starterpack";

export enum PurchaseState {
  SELECTION = 0,
  PAYMENT_METHOD_SELECTION = 1,
  NETWORK_SELECTION = 2,
  WALLET_SELECTION = 3,
  STRIPE_CHECKOUT = 4,
  CRYPTO_CHECKOUT = 5,
  SUCCESS = 6,
}

export type PurchaseCreditsProps = {
  isSlot?: boolean;
  wallets?: ExternalWallet[];
  type: PurchaseType;
  starterpackDetails?: StarterPackDetails;
  initState?: PurchaseState;
  onBack?: () => void;
};

export type PricingDetails = {
  baseCostInCents: number;
  processingFeeInCents: number;
  totalInCents: number;
};

export type Network = {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
};

export type StripeResponse = {
  clientSecret: string;
  pricing: PricingDetails;
};
