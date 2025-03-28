export type ExternalWalletType = "argent" | "metamask" | "phantom";
export type ExternalPlatform = "starknet" | "ethereum" | "solana";

export interface ExternalWallet {
  type: ExternalWalletType;
  available: boolean;
  version?: string;
  chainId?: string;
  name?: string;
  platform?: ExternalPlatform;
}

export interface ExternalWalletResponse<T = unknown> {
  success: boolean;
  wallet: ExternalWalletType;
  result?: T;
  error?: string;
  account?: string;
}

export interface WalletAdapter {
  type: ExternalWalletType;
  platform: ExternalPlatform;

  // Methods
  isAvailable(): boolean;
  getInfo(): ExternalWallet;
  connect(): Promise<ExternalWalletResponse<any>>;
  signMessage?(message: string): Promise<ExternalWalletResponse<any>>;
  signTypedData?(data: any): Promise<ExternalWalletResponse<any>>;
  sendTransaction(tx: any): Promise<ExternalWalletResponse<any>>;
  getBalance(tokenAddress?: string): Promise<ExternalWalletResponse<any>>;
}
