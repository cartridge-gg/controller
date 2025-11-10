import { StarterpackDetails } from "@/context";
import { ExternalWallet } from "@cartridge/controller";
import { PurchaseType } from "@cartridge/ui/utils/api/cartridge";

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
  starterpackDetails?: StarterpackDetails;
  initState?: PurchaseState;
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
