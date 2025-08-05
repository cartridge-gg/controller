import { PurchaseItem } from "@/context/purchase";
import { ExternalPlatform, ExternalWalletType } from "@cartridge/controller";

export interface Wallet {
  name: string;
  type: ExternalWalletType;
  icon: React.ReactNode;
  color?: string;
  enabled?: boolean;
}

export interface Network {
  name: string;
  platform: ExternalPlatform;
  icon: React.ReactNode;
  subIcon?: React.ReactNode;
  enabled?: boolean;
  wallets: Map<string, Wallet>;
}

export interface NetworkWalletData {
  networks: Network[];
}

export type CostDetails = {
  baseCostInCents: number;
  processingFeeInCents: number;
  totalInCents: number;
};

export type ReceivingProps = {
  title?: string;
  items: PurchaseItem[];
  isLoading?: boolean;
};
