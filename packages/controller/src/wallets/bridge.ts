import { getAddress } from "ethers";
import { ArgentWallet } from "./argent";
import { MetaMaskWallet } from "./metamask";
import { PhantomWallet } from "./phantom";
import { RabbyWallet } from "./rabby";
import {
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
  WalletAdapter,
} from "./types";

export class WalletBridge {
  private readonly walletAdapters: Map<ExternalWalletType, WalletAdapter>;

  constructor() {
    this.walletAdapters = new Map<ExternalWalletType, WalletAdapter>();

    if (typeof window == "undefined") {
      return;
    }

    const metamask = new MetaMaskWallet();
    metamask.isAvailable() && this.walletAdapters.set("metamask", metamask);

    const phantom = new PhantomWallet();
    phantom.isAvailable() && this.walletAdapters.set("phantom", phantom);

    const argent = new ArgentWallet();
    argent.isAvailable() && this.walletAdapters.set("argent", argent);

    const rabby = new RabbyWallet();
    rabby.isAvailable() && this.walletAdapters.set("rabby", rabby);

    window.wallet_bridge = this;
  }

  getIFrameMethods() {
    return {
      externalDetectWallets: (_origin: string) => () => this.detectWallets(),
      externalConnectWallet:
        (_origin: string) => (type: ExternalWalletType, address?: string) =>
          this.connectWallet(type, address),
      externalDisconnectWallet:
        (_origin: string) => (type: ExternalWalletType) =>
          this.disconnectWallet(type),
      externalSignMessage:
        (_origin: string) =>
        (identifier: ExternalWalletType | string, message: string) =>
          this.signMessage(identifier, message),
      externalSignTypedData:
        (_origin: string) =>
        (identifier: ExternalWalletType | string, data: any) =>
          this.signTypedData(identifier, data),
      externalSendTransaction:
        (_origin: string) =>
        (identifier: ExternalWalletType | string, txn: any) =>
          this.sendTransaction(identifier, txn),
      externalGetBalance:
        (_origin: string) =>
        (identifier: ExternalWalletType | string, tokenAddress?: string) =>
          this.getBalance(identifier, tokenAddress),
    };
  }

  async detectWallets(): Promise<ExternalWallet[]> {
    const wallets = Array.from(this.walletAdapters.values()).map((adapter) =>
      adapter.getInfo(),
    ) as ExternalWallet[];

    return wallets;
  }

  private getWalletAdapterByType(type: ExternalWalletType): WalletAdapter {
    const adapter = this.walletAdapters.get(type);
    if (!adapter) {
      throw new Error(`Unsupported wallet type: ${type}`);
    }
    return adapter;
  }

  private handleError(
    identifier: ExternalWalletType | string,
    error: unknown,
    operation: string,
    responseType?: ExternalWalletType,
  ): ExternalWalletResponse {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    let walletType: ExternalWalletType | string = "unknown";
    if (typeof identifier === "string") {
      const adapter = this.getConnectedWalletAdapter(identifier);
      walletType = responseType ?? adapter?.type ?? identifier;
    } else {
      walletType = identifier;
    }

    console.error(`Error ${operation} with ${identifier} wallet:`, error);
    return {
      success: false,
      wallet: walletType as ExternalWalletType,
      error: errorMessage,
    };
  }

  async connectWallet(
    type: ExternalWalletType,
    address?: string,
  ): Promise<ExternalWalletResponse> {
    try {
      const wallet = this.getWalletAdapterByType(type);
      const response = await wallet.connect(address);

      if (response.success && response.account) {
        console.log(
          `Wallet ${type} connected with address ${response.account}`,
        );
      } else if (response.success && !response.account) {
        console.error(
          `Wallet ${type} connected successfully but did not provide an address.`,
        );
        return {
          ...response,
          success: false,
          error: "Wallet connected but address not found.",
        };
      }

      return response;
    } catch (error) {
      return this.handleError(type, error, "connecting to");
    }
  }

  async disconnectWallet(
    type: ExternalWalletType,
  ): Promise<ExternalWalletResponse> {
    try {
      const wallet = this.getWalletAdapterByType(type);
      return await wallet.disconnect();
    } catch (error) {
      return this.handleError(type, error, "disconnecting from");
    }
  }

  private getConnectedWalletAdapter(
    identifier: ExternalWalletType | string,
  ): WalletAdapter {
    let wallet: WalletAdapter | undefined;
    if (typeof identifier === "string") {
      // this is an address
      const checkSummedAddress = getAddress(identifier);

      wallet = this.walletAdapters.values().find((adapter) => {
        return (
          adapter.getConnectedAccounts().includes(checkSummedAddress) ||
          adapter.type === checkSummedAddress
        );
      });
    } else {
      wallet = this.walletAdapters.get(identifier);
    }

    if (!wallet && typeof identifier === "string") {
      wallet = this.walletAdapters
        .values()
        .find((adapter) =>
          adapter.getConnectedAccounts().includes(getAddress(identifier)),
        );
    }

    if (!wallet) {
      throw new Error(
        `Wallet with identifier ${identifier} is not connected or supported`,
      );
    }
    return wallet;
  }

  async signMessage(
    identifier: ExternalWalletType | string,
    message: string,
  ): Promise<ExternalWalletResponse> {
    let wallet: WalletAdapter | undefined;
    try {
      wallet = this.getConnectedWalletAdapter(identifier);
      if (!wallet.signMessage) {
        throw new Error(
          `Wallet type ${wallet.type} (identifier: ${identifier}) does not support signing messages`,
        );
      }
      return await wallet.signMessage(message);
    } catch (error) {
      return this.handleError(
        identifier,
        error,
        "signing message with",
        wallet?.type,
      );
    }
  }

  async signTypedData(
    identifier: ExternalWalletType | string,
    data: any,
  ): Promise<ExternalWalletResponse> {
    let wallet: WalletAdapter | undefined;
    try {
      wallet = this.getConnectedWalletAdapter(identifier);
      if (!wallet.signTypedData) {
        throw new Error(
          `Wallet type ${wallet.type} (identifier: ${identifier}) does not support signing typed data`,
        );
      }
      return await wallet.signTypedData(data);
    } catch (error) {
      return this.handleError(
        identifier,
        error,
        "signing typed data with",
        wallet?.type,
      );
    }
  }

  async sendTransaction(
    identifier: ExternalWalletType | string,
    txn: any,
  ): Promise<ExternalWalletResponse> {
    let wallet: WalletAdapter | undefined;
    try {
      wallet = this.getConnectedWalletAdapter(identifier);
      return await wallet.sendTransaction(txn);
    } catch (error) {
      return this.handleError(
        identifier,
        error,
        "sending transaction with",
        wallet?.type,
      );
    }
  }

  async getBalance(
    identifier: ExternalWalletType | string,
    tokenAddress?: string,
  ): Promise<ExternalWalletResponse> {
    let wallet: WalletAdapter | undefined;
    try {
      wallet = this.getConnectedWalletAdapter(identifier);
      return await wallet.getBalance(tokenAddress);
    } catch (error) {
      return this.handleError(
        identifier,
        error,
        "getting balance from",
        wallet?.type,
      );
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
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
  WalletAdapter,
} from "./types";
