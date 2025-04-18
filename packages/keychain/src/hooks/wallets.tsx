import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  PropsWithChildren,
  useMemo,
} from "react";
import {
  ExternalWallet,
  ExternalWalletType,
  ExternalWalletResponse,
} from "@cartridge/controller";
import { ParentMethods, useConnection } from "./connection";

interface WalletsContextValue {
  wallets: ExternalWallet[];
  isLoading: boolean;
  isConnecting: boolean;
  error: Error | null;
  detectWallets: () => Promise<void>;
  connectWallet: (
    type: ExternalWalletType,
  ) => Promise<ExternalWalletResponse | null>;
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
      type: ExternalWalletType,
    ): Promise<ExternalWalletResponse | null> => {
      if (!parent) {
        setError(new Error("Connection not ready."));
        return null;
      }

      setIsConnecting(true);
      setError(null);

      try {
        const response = await parent.externalConnectWallet(type);
        if (!response.success) {
          setError(new Error(response.error || "Failed to connect wallet."));
          return response; // Return response even on failure
        }
        // Optionally re-detect wallets or update state based on response
        return response;
      } catch (err) {
        console.error(`Failed to connect to wallet ${type}:`, err);
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

  const value = useMemo(
    () => ({
      wallets,
      isLoading,
      isConnecting,
      error,
      detectWallets,
      connectWallet,
    }),
    [wallets, isLoading, isConnecting, error, detectWallets, connectWallet],
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

  // Method to set the parent connection once established
  constructor(parent: ParentMethods) {
    console.log("KeychainWallets: Parent connection set.");
    this.parent = parent;
  }

  /**
   * Signs a message using either an embedded wallet or the external bridge.
   * @param identifier - The identifier (e.g., address) of the wallet.
   * @param message - The message hex string to sign.
   * @returns Promise resolving to the signature hex string.
   * @throws Error if signing fails or the connection isn't ready.
   */
  async signMessage(identifier: string, message: string): Promise<string> {
    console.log(
      `KeychainWallets: signMessage called for identifier: ${identifier}`,
    );

    // --- Decision Logic ---
    // TODO: Implement logic to check if 'identifier' belongs to an embedded wallet (e.g., Turnkey)
    const isEmbedded = false; // Placeholder

    if (isEmbedded) {
      // --- Embedded Wallet Path ---
      console.log(
        `KeychainWallets: Routing to embedded wallet for ${identifier}`,
      );
      // TODO: Call the sign method of the appropriate embedded wallet instance
      throw new Error("Embedded wallet signing not yet implemented.");
    } else {
      // --- External Wallet Path ---
      console.log(
        `KeychainWallets: Routing to external wallet bridge for ${identifier}`,
      );
      if (!this.parent) {
        console.error("KeychainWallets: Parent connection not available.");
        throw new Error("Wallet connection not ready.");
      }

      try {
        // Call the parent window's bridge method via penpal
        // Note: Parent's externalSignMessage now expects identifier string
        const response = await this.parent.externalSignMessage(
          identifier,
          message,
        );
        console.log(
          "KeychainWallets: Received response from parent:",
          response,
        );

        if (response.success && response.result) {
          // Assuming response.result is the signature string
          // Ensure it's actually a string before returning
          if (typeof response.result === "string") {
            return response.result;
          } else {
            console.error(
              "KeychainWallets: Parent response result is not a string:",
              response.result,
            );
            throw new Error(
              "Invalid signature format received from wallet bridge.",
            );
          }
        } else {
          const errorMsg =
            response.error || "Unknown error from external wallet bridge.";
          console.error(
            `KeychainWallets: Error from parent bridge: ${errorMsg}`,
          );
          throw new Error(errorMsg);
        }
      } catch (error) {
        console.error(
          "KeychainWallets: Failed to call externalSignMessage:",
          error,
        );
        // Re-throw the error to be caught by the WASM caller
        throw error instanceof Error ? error : new Error(String(error));
      }
    }
  }
}
