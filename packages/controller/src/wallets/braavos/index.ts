import { TypedData } from "@starknet-io/types-js";
import { connect, StarknetWindowObject } from "starknetkit";
import { InjectedConnector } from "starknetkit/injected";
import {
  ExternalPlatform,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
  WalletAdapter,
} from "../types";

export class BraavosWallet implements WalletAdapter {
  readonly type: ExternalWalletType = "braavos";
  readonly platform: ExternalPlatform = "starknet";
  private wallet: StarknetWindowObject | undefined = undefined;
  private account: string | undefined = undefined;
  private connectedAccounts: string[] = [];

  isAvailable(): boolean {
    return typeof window !== "undefined" && !!window.starknet_braavos;
  }

  getInfo(): ExternalWallet {
    const available = this.isAvailable();

    return {
      type: this.type,
      available,
      version: available
        ? window.starknet_braavos?.version || "Unknown"
        : undefined,
      chainId: available ? window.starknet_braavos?.chainId : undefined,
      name: "Braavos",
      platform: this.platform,
    };
  }

  async connect(): Promise<ExternalWalletResponse<any>> {
    if (this.account) {
      return { success: true, wallet: this.type, account: this.account };
    }

    try {
      if (!this.isAvailable()) {
        throw new Error("Braavos is not available");
      }

      const { wallet, connectorData } = await connect({
        connectors: [new InjectedConnector({ options: { id: "braavos" } })],
      });

      if (!wallet) {
        throw new Error("No wallet found");
      }

      this.wallet = wallet;
      this.account = connectorData?.account;
      return { success: true, wallet: this.type, account: this.account };
    } catch (error) {
      console.error(`Error connecting to Braavos:`, error);
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

  async signTypedData(data: TypedData): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.wallet) {
        throw new Error("Braavos is not connected");
      }

      const sig = await this.wallet.request({
        type: "wallet_signTypedData",
        params: data,
      });

      return { success: true, wallet: this.type, result: sig };
    } catch (error) {
      console.error(`Error signing typed data with Braavos:`, error);
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
      "Chain switching for Braavos may require custom implementation",
    );
    return false;
  }

  async getBalance(
    _tokenAddress?: string,
  ): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.wallet) {
        throw new Error("Braavos is not connected");
      }

      // TODO: Implement balance fetching based on Braavos's API
      return {
        success: true,
        wallet: this.type,
        result: "Implement based on Braavos API",
      };
    } catch (error) {
      console.error(`Error getting balance from Braavos:`, error);
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
      error: "waitForTransaction not supported for Braavos wallet",
    };
  }
}
