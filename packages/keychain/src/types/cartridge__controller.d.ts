declare module "@cartridge/controller" {
  export type AuthOption = string;

  export interface AuthOptionConfig {
    id: string;
    name: string;
    icon: string;
    description?: string;
    length?: number; // Added for signupOptions.length check
  }

  export interface AuthOptions {
    [key: string]: AuthOptionConfig;
  }

  export interface ExternalWallet {
    type: ExternalWalletType | string;
    name?: string; // Made optional for stories
    icon?: string; // Made optional for stories
    address?: string;
    available?: boolean;
    connectedAccounts?: string[];
    platform?: string | ExternalPlatform;
  }

  export enum ExternalWalletType {
    Braavos = "braavos",
    ArgentX = "argentX",
    OKX = "okx",
    Phantom = "phantom",
    Metamask = "metamask",
    Rabby = "rabby",
    Discord = "discord",
    WalletConnect = "walletconnect",
  }

  export interface ExternalWalletResponse {
    code: ResponseCodes;
    message: string;
    data?: unknown;
    success?: boolean;
    result?: unknown;
    error?: string;
    account?: string;
  }

  export enum ResponseCodes {
    SUCCESS = 200,
    CANCELED = 400,
    NOT_CONNECTED = 401,
    USER_INTERACTION_REQUIRED = 402,
    REJECTED = 403,
    NOT_FOUND = 404,
    TIMEOUT = 408,
    INTERNAL_ERROR = 500,
    ERROR = 501, // Changed from 500 to avoid duplicate enum value
  }

  export enum ExternalPlatform {
    Braavos = "braavos",
    ArgentX = "argentX",
    OKX = "okx",
    Solana = "solana",
    Ethereum = "ethereum",
    Starknet = "starknet",
    Phantom = "phantom",
  }

  export interface ControllerError {
    code: ResponseCodes | number;
    message: string;
    data?: unknown;
  }

  export interface ConnectReply {
    code: ResponseCodes;
    message: string;
    data?: unknown;
  }

  export interface ProbeReply {
    code: ResponseCodes;
    message?: string; // Made optional for compatibility
    data?: unknown;
    address?: string;
    rpcUrl?: string;
  }

  export interface ExecuteReply {
    code: ResponseCodes;
    message?: string; // Made optional for compatibility
    data?: unknown;
    transaction_hash?: string;
    error?: unknown;
  }

  export interface DeployReply {
    code: ResponseCodes;
    message: string;
    data?: unknown;
  }

  export interface SessionPolicies {
    [key: string]: unknown;
  }

  export interface WalletAdapter {
    connect: () => Promise<unknown>;
    disconnect: () => Promise<void>;
    signMessage?: (message: string) => Promise<unknown>;
    signTransaction?: (transaction: unknown) => Promise<unknown>;
  }

  export interface ConnectError {
    code: number;
    name?: string; // Made optional for compatibility
    message?: string; // Made optional for compatibility
    error?: unknown;
  }

  export enum FeeSource {
    User = "user",
    Dapp = "dapp",
    PAYMASTER = "paymaster",
    CREDITS = "credits",
  }

  export type Signature = {
    signature: string;
    [key: string]: unknown;
  };

  export type ErrorCode = number | ResponseCodes;

  export function toArray<T>(value: T | T[]): T[];
  export function toSessionPolicies(policies: unknown): SessionPolicies;
  export function humanizeString(str: string): string;
}
