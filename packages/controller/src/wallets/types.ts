export type SupportedWallet = "argent" | "metamask" | "phantom";
export type WalletPlatform = "starknet" | "ethereum" | "solana";

export interface WalletInfo {
  type: SupportedWallet;
  available: boolean;
  version?: string;
  chainId?: string;
  name?: string;
  platform?: WalletPlatform;
}

export interface WalletResponse<T = unknown> {
  success: boolean;
  wallet: SupportedWallet;
  result?: T;
  error?: string;
  account?: string;
}

export interface WalletAdapter {
  type: SupportedWallet;
  platform: WalletPlatform;

  // Methods
  isAvailable(): boolean;
  getInfo(): WalletInfo;
  connect(): Promise<WalletResponse<any>>;
  signTransaction(transaction: any): Promise<WalletResponse<any>>;
  switchChain(chainId: string): Promise<boolean>;
  getBalance(tokenAddress?: string): Promise<WalletResponse<any>>;
}
