import {
  awaitWithTimeout,
  getPromiseWithResolvers,
  PromiseWithResolvers,
} from "@/utils/promises";
import {
  ExternalPlatform,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
  WalletAdapter,
} from "@cartridge/controller";
import {
  EthereumProvider,
  default as Provider,
} from "@walletconnect/ethereum-provider";
import { getAddress } from "ethers";

export type OpenQrCodeEvent = {
  uri: string;
};

const REOWN_PROJECT_ID = "9e74c94c62b9f42303d951e0b8375c14";
export class WalletConnectWallet implements WalletAdapter {
  readonly type: ExternalWalletType = "walletconnect" as ExternalWalletType;
  readonly platform: ExternalPlatform = "ethereum";
  account: string | undefined = undefined;
  private providerPromise: Promise<Provider> | undefined = undefined;
  private connectionPromise: PromiseWithResolvers<void> | undefined = undefined;

  constructor() {
    this.providerPromise = EthereumProvider.init({
      projectId: REOWN_PROJECT_ID,
      metadata: {
        name: "Cartridge",
        description: "Cartridge Controller, a wallet designed for gamers",
        url: "https://cartridge.gg",
        icons: ["https://avatars.githubusercontent.com/u/101216134?s=200&v=4"],
      },
      showQrModal: false,
      chains: [1],
      optionalChains: [1],
      optionalMethods: ["eth_requestAccounts", "personal_sign"],
      methods: [],
    }).then((provider) => {
      provider.disconnect();

      provider.on("display_uri", (uri: string) => {
        window.dispatchEvent(
          new CustomEvent("open-qr-code", { detail: { uri } }),
        );
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      provider.on("connect", (_: { chainId: string }) => {
        window.dispatchEvent(new CustomEvent("close-qr-code"));
        this.connectionPromise?.resolve();
      });
      provider.on("disconnect", () => {
        window.dispatchEvent(new CustomEvent("close-qr-code"));
        this.connectionPromise?.resolve();
      });
      window.addEventListener("qr-code-cancelled", () => {
        this.connectionPromise?.reject(new Error("User cancelled"));
      });
      return provider;
    });
  }

  getConnectedAccounts(): string[] {
    return this.account ? [this.account] : [];
  }

  isAvailable(): boolean {
    return typeof window !== "undefined" && !!this.providerPromise;
  }

  getInfo(): ExternalWallet {
    const available = this.isAvailable();

    return {
      type: this.type,
      available,
      version: available ? window.ethereum?.version || "Unknown" : undefined,
      chainId: available ? window.ethereum?.chainId : undefined,
      name: "WalletConnect",
      platform: this.platform,
    };
  }

  async connect(): Promise<ExternalWalletResponse<never>> {
    try {
      if (!this.isAvailable()) {
        throw new Error("WalletConnect is not available");
      }

      this.connectionPromise = getPromiseWithResolvers<void>();

      const provider = await this.getProvider(10_000);

      await provider.disconnect();

      provider.connect();

      await awaitWithTimeout(this.connectionPromise.promise, 120_000);

      const accounts = await provider.request<string[]>({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        const address = getAddress(accounts[0]);
        this.account = address;
        return { success: true, wallet: this.type, account: this.account };
      }

      throw new Error("No accounts found");
    } catch (error) {
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    } finally {
      this.connectionPromise = undefined;
    }
  }

  async signTransaction(
    transaction: string,
  ): Promise<ExternalWalletResponse<string>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("WalletConnect is not connected");
      }

      const provider = await this.getProvider(10_000);

      const result = await provider.request<string>({
        method: "eth_sendTransaction",
        params: [transaction],
      });

      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(`Error signing transaction with WalletConnect:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async signMessage(
    message: `0x${string}`,
  ): Promise<ExternalWalletResponse<string>> {
    try {
      if (!this.isAvailable()) {
        throw new Error("WalletConnect is not connected");
      }
      if (!this.account) {
        await this.connect();
      }

      const provider = await this.getProvider(10_000);

      const result = await provider.request<string>({
        method: "personal_sign",
        params: [message, this.account!],
      });

      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(`Error signing message with WalletConnect:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  async signTypedData(data: string): Promise<ExternalWalletResponse<string>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("WalletConnect is not connected");
      }

      const provider = await this.getProvider(10_000);

      const result = await provider.request<string>({
        method: "eth_signTypedData_v4",
        params: [this.account, JSON.stringify(data)],
      });

      return { success: true, wallet: this.type, result };
    } catch (error) {
      console.error(`Error signing typed data with WalletConnect:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sendTransaction(_txn: string): Promise<ExternalWalletResponse<string>> {
    throw new Error("Not implemented");
  }

  async waitForTransaction(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _txHash: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _timeoutMs?: number,
  ): Promise<ExternalWalletResponse<string>> {
    throw new Error("Not implemented");
  }

  async switchChain(chainId: string): Promise<boolean> {
    try {
      if (!this.isAvailable()) {
        throw new Error("WalletConnect is not available");
      }

      try {
        const provider = await this.getProvider(10_000);

        await provider.request<boolean>({
          method: "wallet_switchEthereumChain",
          params: [{ chainId }],
        });
        return true;
      } catch (error) {
        if ((error as { code: number }).code === 4902) {
          console.warn("Chain not added to WalletConnect");
        }
        throw error;
      }
    } catch (error) {
      console.error(`Error switching chain for WalletConnect:`, error);
      return false;
    }
  }

  async getBalance(
    tokenAddress?: string,
  ): Promise<ExternalWalletResponse<string>> {
    try {
      if (!this.isAvailable() || !this.account) {
        throw new Error("WalletConnect is not connected");
      }

      if (tokenAddress) {
        return {
          success: false,
          wallet: this.type,
          error: "Not implemented for ERC20",
        };
      } else {
        const provider = await this.getProvider(10_000);

        const balance = await provider.request<string>({
          method: "eth_getBalance",
          params: [this.account, "latest"],
        });
        return { success: true, wallet: this.type, result: balance };
      }
    } catch (error) {
      console.error(`Error getting balance from WalletConnect:`, error);
      return {
        success: false,
        wallet: this.type,
        error: (error as Error).message || "Unknown error",
      };
    }
  }

  private async getProvider(timeoutMs: number): Promise<Provider> {
    if (!this.providerPromise) {
      throw new Error("Provider not initialized");
    }
    return awaitWithTimeout(this.providerPromise, timeoutMs);
  }
}
