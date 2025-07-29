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

export enum PurchaseItemType {
  CREDIT = "CREDIT",
  ERC20 = "ERC20",
  NFT = "NFT",
}

export type CostDetails = {
  baseCostInCents: number;
  processingFeeInCents: number;
  totalInCents: number;
};

export type PurchaseItem = {
  title: string;
  subtitle?: string;
  icon: string | React.ReactNode;
  value?: number;
  type: PurchaseItemType;
};

export type ReceivingProps = {
  title?: string;
  items: PurchaseItem[];
  isLoading?: boolean;
};
