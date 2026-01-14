import { credentialToAuth } from "@/components/connect/types";
import {
  AUTH_EXTERNAL_WALLETS,
  AuthExternalWallet,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
  WalletAdapter,
} from "@cartridge/controller";
import { CredentialMetadata } from "@cartridge/ui/utils/api/cartridge";
import { getAddress } from "ethers/address";
import { ExternalWalletError } from "@/utils/errors";
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ParentMethods, useConnection } from "./connection";

interface WalletsContextValue {
  wallets: ExternalWallet[];
  supportedWalletsForAuth: AuthExternalWallet[];
  isLoading: boolean;
  isConnecting: boolean;
  error: Error | null;
  detectWallets: () => Promise<void>;
  connectWallet: (
    type: ExternalWalletType,
  ) => Promise<ExternalWalletResponse | null>;
  isExtensionMissing: (signer: CredentialMetadata) => boolean;
  switchChain: (
    identifier: ExternalWalletType,
    chainId: string,
  ) => Promise<boolean>;
}

declare global {
  interface Window {
    keychain_wallets?: KeychainWallets;
  }
}

const WalletsContext = createContext<WalletsContextValue | undefined>(
  undefined,
);

export const WalletsProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { parent } = useConnection();
  const [wallets, setWallets] = useState<ExternalWallet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Instantiate KeychainWallets once parent is available
  useEffect(() => {
    if (parent && !window.keychain_wallets) {
      window.keychain_wallets = new KeychainWallets(parent);

      // Cleanup on unmount
      return () => {
        delete window.keychain_wallets;
      };
    }
  }, [parent]);

  useEffect(() => {
    if (!parent) {
      return;
    }

    const intervalId = setInterval(async () => {
      const detected = await parent.externalDetectWallets();

      const getWalletIdentifier = (wallet: ExternalWallet) => {
        const sortedAccounts = [...(wallet.connectedAccounts || [])]
          .sort()
          .join(",");
        return `${wallet.type}:${sortedAccounts}`;
      };

      const currentWalletIds = new Set(wallets.map(getWalletIdentifier));
      const detectedWalletIds = new Set(detected.map(getWalletIdentifier));

      if (
        currentWalletIds.size !== detectedWalletIds.size ||
        !Array.from(detectedWalletIds).every((id) => currentWalletIds.has(id))
      ) {
        setWallets(detected);
      }
    }, 300);
    return () => clearInterval(intervalId);
  }, [parent, wallets]);

  // Function to detect external wallets
  const detectWallets = useCallback(async () => {
    if (!parent) {
      console.warn("Cannot detect wallets: parent connection not ready.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const detected = await parent.externalDetectWallets();
      setWallets(detected);
    } catch (err) {
      console.error("Failed to detect external wallets:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to detect wallets"),
      );
      setWallets([]); // Clear wallets on error
    } finally {
      setIsLoading(false);
    }
  }, [parent]);

  // Effect to detect wallets initially when parent is ready
  useEffect(() => {
    if (parent) {
      detectWallets();
    }
  }, [parent, detectWallets]);

  // Function to connect to an external wallet
  const connectWallet = useCallback(
    async (
      identifier: ExternalWalletType,
    ): Promise<ExternalWalletResponse | null> => {
      if (!parent) {
        setError(new Error("Connection not ready."));
        return null;
      }

      setIsConnecting(true);
      setError(null);

      try {
        const response = await parent.externalConnectWallet(identifier);
        if (!response.success) {
          setError(
            new ExternalWalletError(
              response.error || "Failed to connect wallet.",
            ),
          );
          return response; // Return response even on failure
        }
        // Optionally re-detect wallets or update state based on response
        return response;
      } catch (err) {
        console.error(`Failed to connect to wallet ${identifier}:`, err);
        setError(
          err instanceof Error ? err : new Error("Failed to connect wallet"),
        );
        return null;
      } finally {
        setIsConnecting(false);
      }
    },
    [parent],
  );

  const switchChain = useCallback(
    async (identifier: ExternalWalletType, chainId: string) => {
      if (!parent) {
        setError(new Error("Connection not ready."));
        return false;
      }

      try {
        return await parent.externalSwitchChain(identifier, chainId);
      } catch (err) {
        console.error(`Failed to switch chain for wallet ${identifier}:`, err);
        setError(
          err instanceof Error ? err : new Error("Failed to switch chain"),
        );
        return false;
      }
    },
    [parent],
  );

  const isExtensionMissing = useCallback(
    (signer: CredentialMetadata) => {
      return !wallets.some(
        (wallet) => wallet.type === credentialToAuth(signer),
      );
    },
    [wallets],
  );

  const supportedWalletsForAuth: AuthExternalWallet[] = useMemo(
    () => [
      ...(wallets
        .map((wallet) => wallet.type)
        .filter((x) =>
          AUTH_EXTERNAL_WALLETS.includes(x as AuthExternalWallet),
        ) as AuthExternalWallet[]),
    ],
    [wallets],
  );

  const value = useMemo(
    () => ({
      wallets,
      isLoading,
      isConnecting,
      error,
      detectWallets,
      connectWallet,
      isExtensionMissing,
      switchChain,
      supportedWalletsForAuth,
    }),
    [
      wallets,
      isLoading,
      isConnecting,
      error,
      detectWallets,
      connectWallet,
      isExtensionMissing,
      switchChain,
      supportedWalletsForAuth,
    ],
  );

  return (
    <WalletsContext.Provider value={value}>{children}</WalletsContext.Provider>
  );
};

export const useWallets = (): WalletsContextValue => {
  const context = useContext(WalletsContext);
  if (context === undefined) {
    throw new Error("useWallets must be used within a WalletsProvider");
  }
  return context;
};

/**
 * Service running in the keychain iframe to handle signing requests.
 * It decides whether to use an embedded wallet or delegate to the
 * external WalletBridge in the parent controller window via penpal.
 */
export class KeychainWallets {
  private parent: ParentMethods;
  private embeddedWalletsByAddress: Map<string, WalletAdapter> = new Map();

  // Method to set the parent connection once established
  constructor(parent: ParentMethods) {
    this.parent = parent;
  }

  /**
   * Adds an embedded wallet to the map of embedded wallets.
   * @param address - The address of the embedded wallet.
   * @param wallet - The wallet adapter instance.
   */
  addEmbeddedWallet(address: string, wallet: WalletAdapter) {
    this.embeddedWalletsByAddress.set(getAddress(address), wallet);
  }

  /**
   * Gets an embedded wallet from the map of embedded wallets.
   * @param address - The address of the embedded wallet.
   * @returns The wallet adapter instance or undefined if not found.
   */
  getEmbeddedWallet(address: string): WalletAdapter | undefined {
    return this.embeddedWalletsByAddress.get(getAddress(address));
  }

  /**
   * Signs a message using either an embedded wallet or the external bridge.
   * @param identifier - The identifier (e.g., address) of the wallet.
   * @param message - The message hex string to sign.
   * @returns Promise resolving to the signature hex string.
   * @throws Error if signing fails or the connection isn't ready.
   */
  async signMessage(
    identifier: string,
    message: string,
  ): Promise<ExternalWalletResponse> {
    // --- Decision Logic ---
    const embeddedWallet = this.getEmbeddedWallet(identifier);

    if (embeddedWallet) {
      // --- Embedded Wallet Path ---
      const response = await embeddedWallet.signMessage?.(message);
      if (!response?.success) {
        throw new ExternalWalletError(
          `Failed to sign message with embedded wallet. ${response?.error}`,
        );
      }
      return response;
    } else {
      // --- External Wallet Path ---
      if (!this.parent) {
        console.error("KeychainWallets: Parent connection not available.");
        throw new Error("Wallet connection not ready.");
      }

      try {
        // Call the parent window's bridge method via penpal
        // Note: Parent's externalSignMessage now expects identifier string
        const response = await this.parent.externalSignMessage(
          identifier.startsWith("0x") ? getAddress(identifier) : identifier,
          message,
        );

        if (response.success && response.result) {
          // Assuming response.result is the signature string
          // Ensure it's actually a string before returning
          if (typeof response.result === "string") {
            return response;
          } else {
            console.error(
              "KeychainWallets: Parent response result is not a string:",
              response.result,
            );
            throw new ExternalWalletError(
              "Invalid signature format received from wallet bridge.",
            );
          }
        } else {
          const errorMsg =
            response.error || "Unknown error from external wallet bridge.";
          console.error(
            `KeychainWallets: Error from parent bridge: ${errorMsg}`,
          );
          throw new ExternalWalletError(errorMsg);
        }
      } catch (error) {
        console.error(
          "KeychainWallets: Failed to call externalSignMessage:",
          error,
        );
        // Re-throw the error to be caught by the WASM caller
        if (error instanceof ExternalWalletError) {
          throw error;
        }
        throw error instanceof Error
          ? new ExternalWalletError(error.message)
          : new ExternalWalletError(String(error));
      }
    }
  }
}
