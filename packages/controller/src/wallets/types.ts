export type ExternalWalletType =
  | "argent"
  | "braavos"
  | "metamask"
  | "phantom"
  | "rabby"
  | "base";
export type ExternalPlatform =
  | "starknet"
  | "ethereum"
  | "solana"
  | "base"
  | "arbitrum"
  | "optimism";

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
  platform: ExternalPlatform | undefined;

  // Methods
  isAvailable(): boolean;
  getInfo(): ExternalWallet;
  getConnectedAccounts(): string[];
  connect(): Promise<ExternalWalletResponse<string[]>>;
  signMessage?(
    message: string,
    address?: string,
  ): Promise<ExternalWalletResponse<string>>;
  signTypedData?(data: unknown): Promise<ExternalWalletResponse<string>>;
  sendTransaction(tx: unknown): Promise<ExternalWalletResponse<string>>;
  getBalance(tokenAddress?: string): Promise<ExternalWalletResponse<string>>;
  switchChain(chainId: string): Promise<boolean>;
  waitForTransaction(
    txHash: string,
    timeoutMs?: number,
  ): Promise<ExternalWalletResponse<unknown>>;
}
