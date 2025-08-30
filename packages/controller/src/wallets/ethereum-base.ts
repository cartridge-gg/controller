import { getAddress } from "ethers/address";
import { createStore, EIP6963ProviderDetail } from "mipd";
import {
  ExternalPlatform,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
  WalletAdapter,
} from "./types";
import { chainIdToPlatform } from "./platform";

export abstract class EthereumWalletBase implements WalletAdapter {
  abstract readonly type: ExternalWalletType;
  abstract readonly rdns: string;
  abstract readonly displayName: string;

  platform: ExternalPlatform | undefined;
  protected account: string | undefined = undefined;
  protected store = createStore();
  protected provider: EIP6963ProviderDetail | undefined;
  protected connectedAccounts: string[] = [];

  constructor() {
    this.provider = this.store
      .getProviders()
      .find((provider) => provider.info.rdns === this.rdns);

    if (this.provider) {
      this.initializeProvider();
    }
  }

  private initializeProvider(): void {
    this.provider?.provider
      .request({
        method: "eth_accounts",
      })
      .then((accounts) => {
        this.connectedAccounts = accounts.map(getAddress);
        if (accounts.length > 0) {
          this.account = getAddress(accounts[0]);
        }
      });

    this.provider?.provider
      .request({
        method: "eth_chainId",
      })
      .then((chainId) => {
        this.platform = chainIdToPlatform(chainId);
      });

    this.provider?.provider?.on("chainChanged", (chainId: string) => {
      this.platform = chainIdToPlatform(chainId);
    });

    this.provider?.provider?.on("accountsChanged", (accounts: string[]) => {
      if (accounts) {
        this.connectedAccounts = accounts.map((account) => getAddress(account));
        this.account =
          accounts.length > 0 ? getAddress(accounts[0]) : undefined;
      }
    });
  }

  isAvailable(): boolean {
    return typeof window !== "undefined" && !!this.provider;
  }

  getInfo(): ExternalWallet {
    const available = this.isAvailable();

    return {
      type: this.type,
      available,
      version: available ? window.ethereum?.version || "Unknown" : undefined,
      chainId: available ? window.ethereum?.chainId : undefined,
      name: this.displayName,
      platform: this.platform,
      connectedAccounts: this.connectedAccounts,
    };
  }

  getConnectedAccounts(): string[] {
    return this.connectedAccounts;
  }

  async connect(address?: string): Promise<ExternalWalletResponse<any>> {
    if (address && this.connectedAccounts.includes(getAddress(address))) {
      this.account = getAddress(address);
    }

    if (this.account) {
      return { success: true, wallet: this.type, account: this.account };
    }

    try {
      if (!this.isAvailable()) {
        throw new Error(`${this.displayName} is not available`);
      }

      const accounts = await this.provider?.provider.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        this.account = getAddress(accounts[0]);
        this.connectedAccounts = accounts.map(getAddress);
        return { success: true, wallet: this.type, account: this.account };
      }

      throw new Error("No accounts found");
    } catch (error) {
      console.error(`Error connecting to ${this.displayName}:`, error);
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
        throw new Error(`${this.displayName} is not connected`);
      }

      const ethereum = this.provider?.provider;
      if (!ethereum) {
        throw new Error(`${this.displayName} is not connected`);
      }

      const result = await ethereum.request({
        method: "eth_sendTransaction",
        params: [transaction],
      });

      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(
        `Error signing transaction with ${this.displayName}:`,
        error,
      );
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async signMessage(
    message: string | `0x${string}`,
    address?: string,
  ): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error(`${this.displayName} is not connected`);
      }

      const result = await this.provider?.provider.request({
        method: "personal_sign",
        params: [message, address || this.account] as any,
      });

      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(`Error signing message with ${this.displayName}:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async signTypedData(data: any): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error(`${this.displayName} is not connected`);
      }

      const provider = this.provider?.provider;
      if (!provider) {
        throw new Error(`${this.displayName} is not connected`);
      }

      const result = await provider.request({
        method: "eth_signTypedData_v4",
        params: [this.account, JSON.stringify(data)] as any,
      });

      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(
        `Error signing typed data with ${this.displayName}:`,
        error,
      );
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async sendTransaction(txn: any): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error(`${this.displayName} is not connected`);
      }

      const provider = this.provider?.provider;
      if (!provider) {
        throw new Error(`${this.displayName} is not connected`);
      }

      const result = await provider.request({
        method: "eth_sendTransaction",
        params: [txn],
      });

      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(
        `Error sending transaction with ${this.displayName}:`,
        error,
      );
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
        throw new Error(`${this.displayName} is not available`);
      }

      const provider = this.provider?.provider;
      if (!provider) {
        throw new Error(`${this.displayName} is not connected`);
      }

      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId }],
        });

        this.platform = chainIdToPlatform(chainId);
        return true;
      } catch (error) {
        if ((error as any).code === 4902) {
          console.warn(`Chain not added to ${this.displayName}`);
        }
        throw error;
      }
    } catch (error) {
      console.error(`Error switching chain for ${this.displayName}:`, error);
      return false;
    }
  }

  async getBalance(
    tokenAddress?: string,
  ): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error(`${this.displayName} is not connected`);
      }

      if (tokenAddress) {
        return {
          success: false,
          wallet: this.type,
          error: "Not implemented for ERC20",
        };
      } else {
        const provider = this.provider?.provider;
        if (!provider) {
          throw new Error(`${this.displayName} is not connected`);
        }

        const balance = await provider.request({
          method: "eth_getBalance",
          params: [this.account, "latest"] as any,
        });
        return { success: true, wallet: this.type, result: balance };
      }
    } catch (error) {
      console.error(`Error getting balance from ${this.displayName}:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async waitForTransaction(
    txHash: string,
    timeoutMs: number = 60000,
  ): Promise<ExternalWalletResponse<any>> {
    try {
      if (!this.isAvailable()) {
        throw new Error(`${this.displayName} is not connected`);
      }

      const provider = this.provider?.provider;
      if (!provider) {
        throw new Error(`${this.displayName} is not connected`);
      }

      const startTime = Date.now();
      const pollInterval = 1000; // 1 second

      while (Date.now() - startTime < timeoutMs) {
        const receipt = await provider.request({
          method: "eth_getTransactionReceipt",
          params: [txHash as `0x${string}`],
        });

        if (receipt) {
          return {
            success: true,
            wallet: this.type,
            result: receipt,
          };
        }

        // Wait before polling again
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      }

      throw new Error("Transaction confirmation timed out");
    } catch (error) {
      console.error(
        `Error waiting for transaction with ${this.displayName}:`,
        error,
      );
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }
}
