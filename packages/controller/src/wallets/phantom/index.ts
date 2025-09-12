import {
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "../../utils/solana";
import {
  ExternalPlatform,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
  WalletAdapter,
} from "../types";

interface PhantomProvider {
  isPhantom: boolean;
  publicKey: PublicKey | null;
  isConnected: boolean;
  connect(opts?: { onlyIfTrusted: boolean }): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  signTransaction(
    transaction: Transaction | VersionedTransaction,
  ): Promise<Transaction | VersionedTransaction>;
  signAllTransactions(
    transactions: (Transaction | VersionedTransaction)[],
  ): Promise<(Transaction | VersionedTransaction)[]>;
  signAndSendTransaction(
    transaction: Transaction | VersionedTransaction,
    opts?: { skipPreflight?: boolean; maxRetries?: number },
  ): Promise<{ signature: string }>;
  signMessage(
    message: Uint8Array,
    display?: "utf8" | "hex",
  ): Promise<{ signature: Uint8Array }>;
  on(
    event: "connect" | "disconnect" | "accountChanged",
    handler: (args: unknown) => void,
  ): void;
  request(args: { method: string; params?: unknown }): Promise<unknown>;
}

export class PhantomWallet implements WalletAdapter {
  readonly type: ExternalWalletType = "phantom";
  readonly platform: ExternalPlatform = "solana";
  private account: string | undefined = undefined;
  private connectedAccounts: string[] = [];

  private getProvider(): PhantomProvider {
    if (typeof window === "undefined") {
      throw new Error("Not ready");
    }

    const provider = window.solana;

    if (!provider?.isPhantom) {
      throw new Error("Phantom is not available");
    }

    return provider;
  }

  isAvailable(): boolean {
    return typeof window !== "undefined" && !!window.solana?.isPhantom;
  }

  getInfo(): ExternalWallet {
    const available = this.isAvailable();

    return {
      type: this.type,
      available,
      version: "Unknown",
      name: "Phantom",
      platform: this.platform,
    };
  }

  async connect(): Promise<ExternalWalletResponse<any>> {
    if (this.account) {
      return { success: true, wallet: this.type, account: this.account };
    }

    try {
      if (!this.isAvailable()) {
        throw new Error("Phantom is not available");
      }

      const response = await this.getProvider().connect();
      if (response.publicKey) {
        this.account = response.publicKey.toString();
        return { success: true, wallet: this.type, account: this.account };
      }

      throw new Error("No accounts found");
    } catch (error) {
      console.error(`Error connecting to Phantom:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  getConnectedAccounts(): string[] {
    return this.connectedAccounts;
  }

  async signMessage(message: string): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("Phantom is not connected");
      }

      const encodedMessage = new TextEncoder().encode(message);
      const result = await this.getProvider().signMessage(
        encodedMessage,
        "utf8",
      );
      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(`Error signing message with Phantom:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async sendTransaction(
    serailized_txn: Uint8Array,
  ): Promise<ExternalWalletResponse<any>> {
    if (!this.isAvailable() || !this.account) {
      throw new Error("Phantom is not connected");
    }

    try {
      const txn = Transaction.from(serailized_txn);
      const provider = this.getProvider();
      const result = await provider.signAndSendTransaction(txn);
      return {
        success: true,
        wallet: this.type,
        result,
      };
    } catch (error) {
      console.error(`Error sending transaction with Phantom:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async switchChain(_chainId: string): Promise<boolean> {
    console.warn("Chain switching not supported for Phantom");
    return false;
  }

  async getBalance(
    _tokenAddress?: string,
  ): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("Phantom is not connected");
      }

      // TODO: Implement balance fetching based on Phantom's API
      return {
        success: true,
        wallet: this.type,
        result: "Implement based on Phantom API",
      };
    } catch (error) {
      console.error(`Error getting balance from Phantom:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async waitForTransaction(
    _txHash: string,
    _timeoutMs?: number,
  ): Promise<ExternalWalletResponse<any>> {
    return {
      success: false,
      wallet: this.type,
      error: "waitForTransaction not supported for Phantom wallet",
    };
  }
}
