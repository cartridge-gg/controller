import {
  WalletAdapter,
  WalletInfo,
  WalletResponse,
  SupportedWallet,
  WalletPlatform,
} from "../types";

export class MetaMaskWallet implements WalletAdapter {
  readonly type: SupportedWallet = "metamask";
  readonly platform: WalletPlatform = "ethereum";
  private account: string | undefined = undefined;

  isAvailable(): boolean {
    return typeof window !== "undefined" && !!window.ethereum?.isMetaMask;
  }

  getInfo(): WalletInfo {
    const available = this.isAvailable();

    return {
      type: this.type,
      available,
      version: available ? window.ethereum?.version || "Unknown" : undefined,
      chainId: available ? window.ethereum?.chainId : undefined,
      name: "MetaMask",
      platform: this.platform,
    };
  }

  async connect(): Promise<WalletResponse<any>> {
    if (this.account) {
      return { success: true, wallet: this.type, account: this.account };
    }

    try {
      if (!this.isAvailable()) {
        throw new Error("MetaMask is not available");
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts && accounts.length > 0) {
        this.account = accounts[0];
        return { success: true, wallet: this.type, account: this.account };
      }

      throw new Error("No accounts found");
    } catch (error) {
      console.error(`Error connecting to MetaMask:`, error);
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
        throw new Error("MetaMask is not connected");
      }

      const result = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transaction],
      });

      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(`Error signing transaction with MetaMask:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async switchChain(chainId: string): Promise<boolean> {
    try {
      if (!this.isAvailable()) {
        throw new Error("MetaMask is not available");
      }

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId }],
        });
        return true;
      } catch (error) {
        if ((error as any).code === 4902) {
          console.warn("Chain not added to MetaMask");
        }
        throw error;
      }
    } catch (error) {
      console.error(`Error switching chain for MetaMask:`, error);
      return false;
    }
  }

  async getBalance(tokenAddress?: string): Promise<WalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("MetaMask is not connected");
      }

      if (tokenAddress) {
        return {
          success: false,
          wallet: this.type,
          error: "Not implemented for ERC20",
        };
      } else {
        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [this.account, "latest"],
        });
        return { success: true, wallet: this.type, result: balance };
      }
    } catch (error) {
      console.error(`Error getting balance from MetaMask:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }
}
