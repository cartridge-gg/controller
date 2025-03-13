import { SupportedWallet, WalletAdapter, WalletInfo, WalletResponse } from './types';
import { MetaMaskWallet } from './metamask';
import { PhantomWallet } from './phantom';
import { ArgentWallet } from './argent';

export class WalletBridge {
  private readonly walletAdapters: Map<SupportedWallet, WalletAdapter>;
  private readonly connectedWallets: Map<SupportedWallet, WalletAdapter> = new Map();

  constructor() {
    this.walletAdapters = new Map<SupportedWallet, WalletAdapter>();
    this.walletAdapters.set('metamask', new MetaMaskWallet());
    this.walletAdapters.set('phantom', new PhantomWallet());
    this.walletAdapters.set('argent', new ArgentWallet());

    if (typeof window !== "undefined") {
      window.wallet_bridge = this;
    }
  }

  // Return a frozen object to prevent modification
  getIFrameMethods() {
    return Object.freeze({
      detectWallets: () => this.detectWallets(),
      connectWallet: (type: SupportedWallet) => this.connectWallet(type),
      signTransaction: (type: SupportedWallet, tx: unknown) => this.signTransaction(type, tx),
      switchChain: (type: SupportedWallet, chainId: string) => this.switchChain(type, chainId),
      getBalance: (type: SupportedWallet, tokenAddress?: string) => this.getBalance(type, tokenAddress),
    });
  }

  detectWallets(): WalletInfo[] {
    return Array.from(this.walletAdapters.values()).map(adapter => adapter.getInfo());
  }

  private getWalletAdapter(type: SupportedWallet): WalletAdapter {
    const adapter = this.walletAdapters.get(type);
    if (!adapter) {
      throw new Error(`Unsupported wallet type: ${type}`);
    }
    return adapter;
  }

  // Simplify error handling with a helper method
  private handleError(type: SupportedWallet, error: unknown, operation: string): WalletResponse {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error ${operation} with ${type} wallet:`, error);
    return { success: false, wallet: type, error: errorMessage };
  }

  async connectWallet(type: SupportedWallet): Promise<WalletResponse> {
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
      return this.handleError(type, error, 'connecting to');
    }
  }

  async signTransaction(type: SupportedWallet, transaction: unknown): Promise<WalletResponse> {
    try {
      if (!this.connectedWallets.has(type)) {
        throw new Error(`Wallet ${type} is not connected`);
      }

      const wallet = this.connectedWallets.get(type)!;
      return await wallet.signTransaction(transaction);
    } catch (error) {
      return this.handleError(type, error, 'signing transaction with');
    }
  }

  async switchChain(type: SupportedWallet, chainId: string): Promise<boolean> {
    try {
      const wallet = this.getWalletAdapter(type);
      return await wallet.switchChain(chainId);
    } catch (error) {
      console.error(`Error switching chain for ${type} wallet:`, error);
      return false;
    }
  }

  async getBalance(type: SupportedWallet, tokenAddress?: string): Promise<WalletResponse> {
    try {
      if (!this.connectedWallets.has(type)) {
        throw new Error(`Wallet ${type} is not connected`);
      }

      const wallet = this.connectedWallets.get(type)!;
      return await wallet.getBalance(tokenAddress);
    } catch (error) {
      return this.handleError(type, error, 'getting balance from');
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

export type { SupportedWallet, WalletInfo, WalletResponse, WalletAdapter } from './types';