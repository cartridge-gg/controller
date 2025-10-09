import { getAddress } from "ethers/address";
import { createStore, EIP6963ProviderDetail } from "mipd";
import { isMobile } from "../utils";
import { chainIdToPlatform } from "./platform";
import {
  ExternalPlatform,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
  WalletAdapter,
} from "./types";

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
    this.initializeIfAvailable();
  }

  private getProvider(): EIP6963ProviderDetail | undefined {
    if (!this.provider) {
      this.provider = this.store
        .getProviders()
        .find((provider) => provider.info.rdns === this.rdns);
    }
    return this.provider;
  }

  private getEthereumProvider(): any {
    const provider = this.getProvider();
    if (provider) {
      return provider.provider;
    }

    // Fallback for MetaMask when not announced via EIP-6963
    if (
      this.rdns === "io.metamask" &&
      typeof window !== "undefined" &&
      (window as any).ethereum?.isMetaMask
    ) {
      return (window as any).ethereum;
    }

    return null;
  }

  private initializeIfAvailable(): void {
    const provider = this.getProvider();
    if (provider && !this.initialized) {
      this.initialized = true;
      this.initializeProvider();
    }
  }

  private initialized = false;

  private initializeProvider(): void {
    const provider = this.getProvider();
    if (!provider) return;

    provider.provider
      .request({
        method: "eth_accounts",
      })
      .then((accounts) => {
        this.connectedAccounts = accounts.map(getAddress);
        if (accounts.length > 0) {
          this.account = getAddress(accounts[0]);
        }
      })
      .catch(console.error);

    provider.provider
      .request({
        method: "eth_chainId",
      })
      .then((chainId) => {
        this.platform = chainIdToPlatform(chainId);
      })
      .catch(console.error);

    provider.provider?.on("chainChanged", (chainId: string) => {
      this.platform = chainIdToPlatform(chainId);
    });

    provider.provider?.on("accountsChanged", (accounts: string[]) => {
      if (accounts) {
        this.connectedAccounts = accounts.map((account) => getAddress(account));
        this.account =
          accounts.length > 0 ? getAddress(accounts[0]) : undefined;
      }
    });
  }

  isAvailable(): boolean {
    if (isMobile()) {
      return false;
    }

    // Check dynamically each time, as the provider might be announced after instantiation
    const provider = this.getProvider();

    // Also check for MetaMask via window.ethereum as a fallback for MetaMask specifically
    if (
      !provider &&
      this.rdns === "io.metamask" &&
      typeof window !== "undefined"
    ) {
      // MetaMask might be available via window.ethereum even if not announced via EIP-6963 yet
      return !!(window as any).ethereum?.isMetaMask;
    }

    // Initialize if we just found the provider
    if (provider && !this.initialized) {
      this.initializeIfAvailable();
    }

    return typeof window !== "undefined" && !!provider;
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

      let ethereum: any;
      const provider = this.getProvider();

      if (provider) {
        ethereum = provider.provider;
      } else if (
        this.rdns === "io.metamask" &&
        (window as any).ethereum?.isMetaMask
      ) {
        // Fallback for MetaMask when not announced via EIP-6963
        ethereum = (window as any).ethereum;
      }

      if (!ethereum) {
        throw new Error(`${this.displayName} provider not found`);
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        this.account = getAddress(accounts[0]);
        this.connectedAccounts = accounts.map(getAddress);

        // If we used the fallback, store the ethereum provider for future use
        if (!provider && this.rdns === "io.metamask") {
          // Create a mock EIP6963ProviderDetail for consistency
          this.provider = {
            info: {
              uuid: "metamask-fallback",
              name: "MetaMask",
              icon: "data:image/svg+xml;base64,",
              rdns: "io.metamask",
            },
            provider: ethereum,
          } as EIP6963ProviderDetail;
          this.initializeIfAvailable();
        }

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

      const ethereum = this.getEthereumProvider();
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

      const ethereum = this.getEthereumProvider();
      if (!ethereum) {
        throw new Error(`${this.displayName} provider not found`);
      }
      const result = await ethereum.request({
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

      const ethereum = this.getEthereumProvider();
      if (!ethereum) {
        throw new Error(`${this.displayName} is not connected`);
      }

      const result = await ethereum.request({
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

      const ethereum = this.getEthereumProvider();
      if (!ethereum) {
        throw new Error(`${this.displayName} is not connected`);
      }

      const result = await ethereum.request({
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

      const ethereum = this.getEthereumProvider();
      if (!ethereum) {
        throw new Error(`${this.displayName} is not connected`);
      }

      try {
        await ethereum.request({
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
        const ethereum = this.getEthereumProvider();
        if (!ethereum) {
          throw new Error(`${this.displayName} is not connected`);
        }

        const balance = await ethereum.request({
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

      const ethereum = this.getEthereumProvider();
      if (!ethereum) {
        throw new Error(`${this.displayName} is not connected`);
      }

      const startTime = Date.now();
      const pollInterval = 1000; // 1 second

      while (Date.now() - startTime < timeoutMs) {
        const receipt = await ethereum.request({
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
