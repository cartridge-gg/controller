export const AUTH_EXTERNAL_WALLETS = [
  "metamask",
  "rabby",
  "phantom-evm",
] as const;
export type AuthExternalWallet = (typeof AUTH_EXTERNAL_WALLETS)[number];

export const EXTRA_EXTERNAL_WALLETS = [
  "argent",
  "braavos",
  "phantom",
  "base",
] as const;
export type ExtraExternalWallet = (typeof EXTRA_EXTERNAL_WALLETS)[number];

export const EXTERNAL_WALLETS = [
  ...AUTH_EXTERNAL_WALLETS,
  ...EXTRA_EXTERNAL_WALLETS,
] as const;

export type ExternalWalletType = (typeof EXTERNAL_WALLETS)[number];

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
  connect(): Promise<ExternalWalletResponse<any>>;
  signMessage?(
    message: string,
    address?: string,
  ): Promise<ExternalWalletResponse<any>>;
  signTypedData?(data: any): Promise<ExternalWalletResponse<any>>;
  sendTransaction(tx: any): Promise<ExternalWalletResponse<any>>;
  getBalance(tokenAddress?: string): Promise<ExternalWalletResponse<any>>;
  switchChain(chainId: string): Promise<boolean>;
  waitForTransaction(
    txHash: string,
    timeoutMs?: number,
  ): Promise<ExternalWalletResponse<any>>;
  disconnect?(): void;
}
