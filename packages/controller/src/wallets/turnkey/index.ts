import { TurnkeyIframeClient } from "@turnkey/sdk-browser";
import {
  ExternalPlatform,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
  WalletAdapter,
} from "../types";

export class TurnkeyWallet implements WalletAdapter {
  readonly type: ExternalWalletType = "turnkey";
  readonly platform: ExternalPlatform = "ethereum";
  private account: string | undefined = undefined;

  constructor(private turnkeyIframeClient: TurnkeyIframeClient) {}

  isAvailable(): boolean {
    return typeof window !== "undefined";
  }

  getInfo(): ExternalWallet {
    const available = this.isAvailable();

    return {
      type: this.type,
      available,
      name: "Turnkey",
      platform: this.platform,
    };
  }

  async connect(): Promise<ExternalWalletResponse<any>> {
    if (this.account) {
      return { success: true, wallet: this.type, account: this.account };
    }

    try {
      if (!this.isAvailable()) {
        throw new Error("Turnkey is not available");
      }

      const accounts = await this.turnkeyIframeClient.getWallets();
      if (accounts && accounts.wallets.length > 0) {
        const walletAccount = await this.turnkeyIframeClient.getWalletAccount({
          walletId: accounts.wallets[0].walletId,
        });
        this.account = walletAccount.account.address;
        return { success: true, wallet: this.type, account: this.account };
      }

      throw new Error("No accounts found");
    } catch (error) {
      console.error(`Error connecting to Turnkey:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async signTransaction(
    transaction: any,
  ): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("Turnkey is not connected");
      }

      const result = await this.turnkeyIframeClient.signTransaction({
        signWith: this.account,
        unsignedTransaction: transaction,
        type: "TRANSACTION_TYPE_ETHEREUM",
      });

      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(`Error signing transaction with Turnkey:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async signMessage(message: string): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("Turnkey is not connected");
      }

      const result = await this.turnkeyIframeClient.signRawPayload({
        payload: message,
        signWith: this.account,
        encoding: "PAYLOAD_ENCODING_TEXT_UTF8",
        hashFunction: "HASH_FUNCTION_SHA256",
      });

      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(`Error signing message with Turnkey:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async signTypedData(data: any): Promise<ExternalWalletResponse<any>> {
    return this.signMessage(data);
  }

  async sendTransaction(_txn: any): Promise<ExternalWalletResponse<any>> {
    return {
      success: false,
      wallet: this.type,
      error: "Not implemented",
    };
  }

  async switchChain(_chainId: string): Promise<boolean> {
    return false;
  }

  async getBalance(
    tokenAddress?: string,
  ): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("Turnkey is not connected");
      }

      if (tokenAddress) {
        return {
          success: false,
          wallet: this.type,
          error: "Not implemented for ERC20",
        };
      } else {
        return { success: true, wallet: this.type, result: "0" };
      }
    } catch (error) {
      console.error(`Error getting balance from Turnkey:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }
}
