import {
  ExternalWalletType,
  WalletAdapter,
  ExternalWallet,
  ExternalWalletResponse,
} from "./types";
import { MetaMaskWallet } from "./metamask";
import { PhantomWallet } from "./phantom";
import { ArgentWallet } from "./argent";

export class WalletBridge {
  private readonly walletAdapters: Map<ExternalWalletType, WalletAdapter>;
  private readonly connectedWallets: Map<ExternalWalletType, WalletAdapter> =
    new Map();

  constructor() {
    this.walletAdapters = new Map<ExternalWalletType, WalletAdapter>();
    this.walletAdapters.set("metamask", new MetaMaskWallet());
    this.walletAdapters.set("phantom", new PhantomWallet());
    this.walletAdapters.set("argent", new ArgentWallet());

    if (typeof window !== "undefined") {
      window.wallet_bridge = this;
    }
  }

  getIFrameMethods() {
    return {
      externalDetectWallets: (_origin: string) => () => this.detectWallets(),
      externalConnectWallet: (_origin: string) => (type: ExternalWalletType) =>
        this.connectWallet(type),
      externalSignIn:
        (_origin: string) => (type: ExternalWalletType, challenge: string) =>
          this.signIn(type, challenge),
      externalSignMessage:
        (_origin: string) => (type: ExternalWalletType, message: string) =>
          this.signMessage(type, message),
      externalSignTypedData:
        (_origin: string) => (type: ExternalWalletType, data: any) =>
          this.signTypedData(type, data),
      externalGetBalance:
        (_origin: string) =>
        (type: ExternalWalletType, tokenAddress?: string) =>
          this.getBalance(type, tokenAddress),
    };
  }

  async detectWallets(): Promise<ExternalWallet[]> {
    const wallets = Array.from(this.walletAdapters.values()).map((adapter) =>
      adapter.getInfo(),
    ) as ExternalWallet[];

    return wallets;
  }

  private getWalletAdapter(type: ExternalWalletType): WalletAdapter {
    const adapter = this.walletAdapters.get(type);
    if (!adapter) {
      throw new Error(`Unsupported wallet type: ${type}`);
    }
    return adapter;
  }

  private handleError(
    type: ExternalWalletType,
    error: unknown,
    operation: string,
  ): ExternalWalletResponse {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`Error ${operation} with ${type} wallet:`, error);
    return { success: false, wallet: type, error: errorMessage };
  }

  async connectWallet(
    type: ExternalWalletType,
  ): Promise<ExternalWalletResponse> {
    try {
      if (this.connectedWallets.has(type)) {
        const wallet = this.connectedWallets.get(type)!;
        return { success: true, wallet: type, account: wallet.type };
      }

      const wallet = this.getWalletAdapter(type);
      const response = await wallet.connect();

      if (response.success) {
        this.connectedWallets.set(type, wallet);
      }

      return response;
    } catch (error) {
      return this.handleError(type, error, "connecting to");
    }
  }

  async signIn(
    type: ExternalWalletType,
    challenge: string,
  ): Promise<ExternalWalletResponse> {
    try {
      if (this.connectedWallets.has(type)) {
        const wallet = this.connectedWallets.get(type)!;
        return { success: true, wallet: type, account: wallet.type };
      }

      const wallet = this.getWalletAdapter(type);
      const response = await wallet.signIn(challenge);

      if (response.success) {
        this.connectedWallets.set(type, wallet);
      }

      return response;
    } catch (error) {
      return this.handleError(type, error, "connecting to");
    }
  }

  async signMessage(
    type: ExternalWalletType,
    message: string,
  ): Promise<ExternalWalletResponse> {
    try {
      if (!this.connectedWallets.has(type)) {
        throw new Error(`Wallet ${type} is not connected`);
      }

      const wallet = this.connectedWallets.get(type)!;
      if (!wallet.signMessage) {
        throw new Error(`Wallet ${type} does not support signing messages`);
      }

      return await wallet.signMessage(message);
    } catch (error) {
      return this.handleError(type, error, "signing message with");
    }
  }

  async signTypedData(
    type: ExternalWalletType,
    data: any,
  ): Promise<ExternalWalletResponse> {
    try {
      if (!this.connectedWallets.has(type)) {
        throw new Error(`Wallet ${type} is not connected`);
      }

      const wallet = this.connectedWallets.get(type)!;
      if (!wallet.signTypedData) {
        throw new Error(`Wallet ${type} does not support signing typed data`);
      }

      return await wallet.signTypedData(data);
    } catch (error) {
      return this.handleError(type, error, "signing typed data with");
    }
  }

  async getBalance(
    type: ExternalWalletType,
    tokenAddress?: string,
  ): Promise<ExternalWalletResponse> {
    try {
      if (!this.connectedWallets.has(type)) {
        throw new Error(`Wallet ${type} is not connected`);
      }

      const wallet = this.connectedWallets.get(type)!;
      return await wallet.getBalance(tokenAddress);
    } catch (error) {
      return this.handleError(type, error, "getting balance from");
    }
  }
}

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
    starknet_argentX?: any;
    wallet_bridge?: WalletBridge;
  }
}

export type {
  ExternalWalletType,
  ExternalWallet,
  ExternalWalletResponse,
  WalletAdapter,
} from "./types";
