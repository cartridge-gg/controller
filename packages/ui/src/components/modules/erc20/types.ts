export interface ERC20Balance {
  amount: number;
  value: number;
  change: number;
}

export interface ERC20Metadata {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  image: string | undefined;
}

export interface ERC20Token {
  balance: ERC20Balance;
  metadata: ERC20Metadata;
}
