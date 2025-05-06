import {
  WalletAdapter,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
  ExternalPlatform,
} from "../types";
import { connect, StarknetWindowObject } from "starknetkit";
import { InjectedConnector } from "starknetkit/injected";
import { TypedData } from "@starknet-io/types-js";

export class ArgentWallet implements WalletAdapter {
  readonly type: ExternalWalletType = "argent";
  readonly platform: ExternalPlatform = "starknet";
  private wallet: StarknetWindowObject | undefined = undefined;
  private account: string | undefined = undefined;

  isAvailable(): boolean {
    return typeof window !== "undefined" && !!window.starknet_argentX;
  }

  getInfo(): ExternalWallet {
    const available = this.isAvailable();

    return {
      type: this.type,
      available,
      version: available
        ? window.starknet_argentX?.version || "Unknown"
        : undefined,
      chainId: available ? window.starknet_argentX?.chainId : undefined,
      name: "Argent",
      platform: this.platform,
    };
  }

  async connect(): Promise<ExternalWalletResponse<any>> {
    if (this.account) {
      return { success: true, wallet: this.type, account: this.account };
    }

    try {
      if (!this.isAvailable()) {
        throw new Error("Argent is not available");
      }

      const { wallet, connectorData } = await connect({
        connectors: [new InjectedConnector({ options: { id: "argentX" } })],
      });

      if (!wallet) {
        throw new Error("No wallet found");
      }

      this.wallet = wallet;
      this.account = connectorData?.account;
      return { success: true, wallet: this.type, account: this.account };
    } catch (error) {
      console.error(`Error connecting to Argent:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async signIn(): Promise<ExternalWalletResponse<any>> {
    return {
      success: false,
      wallet: this.type,
      error: "Not implemented",
    };
  }

  async signTypedData(data: TypedData): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.wallet) {
        throw new Error("Argent is not connected");
      }

      const sig = await this.wallet.request({
        type: "wallet_signTypedData",
        params: data,
      });

      return { success: true, wallet: this.type, result: sig };
    } catch (error) {
      console.error(`Error signing typed data with Argent:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async sendTransaction(_txn: any): Promise<ExternalWalletResponse<any>> {
    return {
      success: false,
      wallet: this.type,
      error: "Not implemented",
    };
  }

  async switchChain(_chainId: string): Promise<boolean> {
    console.warn(
      "Chain switching for Argent may require custom implementation",
    );
    return false;
  }

  async getBalance(
    _tokenAddress?: string,
  ): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.wallet) {
        throw new Error("Argent is not connected");
      }

      // TODO: Implement balance fetching based on Argent's API
      return {
        success: true,
        wallet: this.type,
        result: "Implement based on Argent API",
      };
    } catch (error) {
      console.error(`Error getting balance from Argent:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }
}
