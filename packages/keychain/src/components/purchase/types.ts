import { ExternalWallet } from "@cartridge/controller";
import { PurchaseType } from "@/hooks/payments/crypto";
import { StarterPackDetails } from "@/hooks/starterpack";

export enum PurchaseState {
  SELECTION = 0,
  STRIPE_CHECKOUT = 1,
  CRYPTO_CHECKOUT = 2,
  SUCCESS = 3,
}

export type PurchaseCreditsProps = {
  title?: string;
  teamId?: string;
  isSlot?: boolean;
  wallets?: ExternalWallet[];
  type: PurchaseType;
  starterpackDetails?: StarterPackDetails;
  initState?: PurchaseState;
  onBack?: () => void;
  onComplete?: () => void;
};

export type PricingDetails = {
  baseCostInCents: number;
  processingFeeInCents: number;
  totalInCents: number;
};

export type StripeResponse = {
  clientSecret: string;
  pricing: PricingDetails;
};
