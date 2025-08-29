import { Item } from "@/context/purchase";
import { ExternalPlatform, ExternalWalletType } from "@cartridge/controller";

export interface Wallet {
  name: string;
  type: ExternalWalletType;
  icon: React.ReactNode;
  color?: string;
}

export interface Network {
  name: string;
  platform: ExternalPlatform;
  chains?: {
    chainId: string;
    isMainnet: boolean;
  }[];
  icon: React.ReactNode;
  subIcon?: React.ReactNode;
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
  items: Item[];
  isLoading?: boolean;
  showTotal?: boolean;
};
