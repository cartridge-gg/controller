import { credentialToAuth } from "@/components/connect/types";
import {
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
} from "@cartridge/controller";
import { CredentialMetadata } from "@cartridge/ui/utils/api/cartridge";
import { KeychainWallets } from "./KeychainWallets";
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useConnection } from "./connection";

interface WalletsContextValue {
  wallets: ExternalWallet[];
  isLoading: boolean;
  isConnecting: boolean;
  error: Error | null;
  detectWallets: () => Promise<void>;
  connectWallet: (
    type: ExternalWalletType,
  ) => Promise<ExternalWalletResponse | null>;
  isExtensionMissing: (signer: CredentialMetadata) => boolean;
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
          setError(new Error(response.error || "Failed to connect wallet."));
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

  const isExtensionMissing = useCallback(
    (signer: CredentialMetadata) => {
      return !wallets.some(
        (wallet) => wallet.type === credentialToAuth(signer),
      );
    },
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
    }),
    [
      wallets,
      isLoading,
      isConnecting,
      error,
      detectWallets,
      connectWallet,
      isExtensionMissing,
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
// Class moved to separate file to fix react-refresh/only-export-components
