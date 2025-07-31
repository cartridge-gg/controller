import { PurchaseItem } from "@/context/purchase";

export interface Wallet {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export interface Network {
  id: string;
  name: string;
  icon: React.ReactNode;
  wallets: Wallet[];
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
