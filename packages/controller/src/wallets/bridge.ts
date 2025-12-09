import { getAddress } from "ethers";
import { ArgentWallet } from "./argent";
import { BaseWallet } from "./base";
import { MetaMaskWallet } from "./metamask";
import { PhantomWallet } from "./phantom";
import { PhantomEVMWallet } from "./phantom-evm";
import { RabbyWallet } from "./rabby";
import {
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
  WalletAdapter,
} from "./types";
import { BraavosWallet } from "./braavos";

export class WalletBridge {
  private readonly walletAdapters: Map<ExternalWalletType, WalletAdapter>;

  constructor() {
    this.walletAdapters = new Map<ExternalWalletType, WalletAdapter>();

    if (typeof window == "undefined") {
      return;
    }

    const metamask = new MetaMaskWallet();
    this.walletAdapters.set("metamask", metamask);

    const phantom = new PhantomWallet();
    this.walletAdapters.set("phantom", phantom);

    const phantomEvm = new PhantomEVMWallet();
    this.walletAdapters.set("phantom-evm", phantomEvm);

    const argent = new ArgentWallet();
    this.walletAdapters.set("argent", argent);

    const braavos = new BraavosWallet();
    this.walletAdapters.set("braavos", braavos);

    const rabby = new RabbyWallet();
    this.walletAdapters.set("rabby", rabby);

    const base = new BaseWallet();
    this.walletAdapters.set("base", base);

    window.wallet_bridge = this;
  }

  getIFrameMethods() {
    return {
      externalDetectWallets: (_origin: string) => () => this.detectWallets(),
      externalConnectWallet: (_origin: string) => (type: ExternalWalletType) =>
        this.connectWallet(type),
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
      externalSwitchChain:
        (_origin: string) =>
        (identifier: ExternalWalletType | string, chainId: string) =>
          this.switchChain(identifier, chainId),
      externalWaitForTransaction:
        (_origin: string) =>
        (
          identifier: ExternalWalletType | string,
          txHash: string,
          timeoutMs?: number,
        ) =>
          this.waitForTransaction(identifier, txHash, timeoutMs),
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
  ): Promise<ExternalWalletResponse> {
    try {
      const wallet = this.getWalletAdapterByType(type);
      const response = await wallet.connect();

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

  private getConnectedWalletAdapter(
    identifier: ExternalWalletType | string,
  ): WalletAdapter {
    let wallet: WalletAdapter | undefined;
    let checkSummedAddress: string;

    try {
      checkSummedAddress = getAddress(identifier);
    } catch {
      // getAddress failed, so this must be a wallet type
      wallet = this.walletAdapters.get(identifier as ExternalWalletType);
      if (!wallet) {
        throw new Error(`Wallet ${identifier} is not connected or supported`);
      }
      return wallet;
    }

    wallet = this.walletAdapters.values().find((adapter) => {
      return adapter.getConnectedAccounts().includes(checkSummedAddress);
    });

    if (!wallet) {
      throw new Error(`No wallet found with connected address ${identifier}`);
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
      return await wallet.signMessage(message, identifier);
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

  async switchChain(
    identifier: ExternalWalletType | string,
    chainId: string,
  ): Promise<boolean> {
    try {
      const wallet = this.getConnectedWalletAdapter(identifier);
      return await wallet.switchChain(chainId);
    } catch (error) {
      console.error(`Error switching chain for ${identifier} wallet:`, error);
      return false;
    }
  }

  async waitForTransaction(
    identifier: ExternalWalletType | string,
    txHash: string,
    timeoutMs?: number,
  ): Promise<ExternalWalletResponse> {
    let wallet: WalletAdapter | undefined;
    try {
      wallet = this.getConnectedWalletAdapter(identifier);
      return await wallet.waitForTransaction(txHash, timeoutMs);
    } catch (error) {
      return this.handleError(
        identifier,
        error,
        "waiting for transaction with",
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
    starknet_braavos?: any;
    wallet_bridge?: WalletBridge;
  }
}

export type {
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
  WalletAdapter,
} from "./types";
