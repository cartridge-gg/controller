export type ExternalWalletType = "argent" | "metamask" | "phantom" | "rabby";
export type ExternalPlatform = "starknet" | "ethereum" | "solana";

export interface ExternalWallet {
  type: ExternalWalletType;
  available: boolean;
  version?: string;
  chainId?: string;
  name?: string;
  platform?: ExternalPlatform;
  connectedAccounts?: string[];
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
  getConnectedAccounts(): string[];
  connect(address?: string): Promise<ExternalWalletResponse<any>>;
  disconnect(): Promise<ExternalWalletResponse<void>>;
  signMessage?(message: string): Promise<ExternalWalletResponse<any>>;
  signTypedData?(data: any): Promise<ExternalWalletResponse<any>>;
  sendTransaction(tx: any): Promise<ExternalWalletResponse<any>>;
  getBalance(tokenAddress?: string): Promise<ExternalWalletResponse<any>>;
}
