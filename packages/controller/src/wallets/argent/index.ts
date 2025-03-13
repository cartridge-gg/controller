import {
  WalletAdapter,
  WalletInfo,
  WalletResponse,
  SupportedWallet,
  WalletPlatform,
} from "../types";

export class ArgentWallet implements WalletAdapter {
  readonly type: SupportedWallet = "argent";
  readonly platform: WalletPlatform = "starknet";
  private account: any | undefined = undefined;

  isAvailable(): boolean {
    return typeof window !== "undefined" && !!window.starknet_argentX;
  }

  getInfo(): WalletInfo {
    const available = this.isAvailable();

    return {
      type: this.type,
      available,
      version: available
        ? window.starknet_argentX?.version || "Unknown"
        : undefined,
      chainId: available ? window.starknet_argentX?.chainId : undefined,
      name: "Argent X",
      platform: this.platform,
    };
  }

  async connect(): Promise<WalletResponse<any>> {
    if (this.account) {
      return { success: true, wallet: this.type, account: this.account };
    }

    try {
      if (!this.isAvailable()) {
        throw new Error("Argent X is not available");
      }

      await window.starknet_argentX.enable();
      const account = window.starknet_argentX.account;
      if (account) {
        this.account = account;
        return { success: true, wallet: this.type, account: this.account };
      }

      throw new Error("No accounts found");
    } catch (error) {
      console.error(`Error connecting to Argent X:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async signTransaction(transaction: any): Promise<WalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("Argent X is not connected");
      }

      const result = await window.starknet_argentX.account.execute(transaction);
      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(`Error signing transaction with Argent X:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async switchChain(chainId: string): Promise<boolean> {
    console.warn(
      "Chain switching for Argent X may require custom implementation",
    );
    return false;
  }

  async getBalance(tokenAddress?: string): Promise<WalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("Argent X is not connected");
      }

      // Implementation depends on Argent X's API
      // This is a placeholder - you'll need to implement based on Argent's actual API
      return {
        success: true,
        wallet: this.type,
        result: "Implement based on Argent API",
      };
    } catch (error) {
      console.error(`Error getting balance from Argent X:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }
}
