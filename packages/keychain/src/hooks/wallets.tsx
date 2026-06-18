import { credentialToAuth } from "@/components/connect/types";
import {
  AUTH_EXTERNAL_WALLETS,
  AuthExternalWallet,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
} from "@cartridge/controller";
import { CredentialMetadata } from "@cartridge/controller-ui/utils/api/cartridge";
import { ExternalWalletError } from "@/utils/errors";
import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useConnection } from "./connection";
import { KeychainWallets } from "./keychain-wallets";
import { WalletsContext } from "./wallets-context";

export const WalletsProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { parent } = useConnection();
  const [wallets, setWallets] = useState<ExternalWallet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Instantiate KeychainWallets once parent is available. Intentionally
  // persist across unmount/remount: embedded wallets registered during an
  // OAuth redirect (e.g. Turnkey social login) must survive the provider
  // remount that runs when preset config loads after setSearchParams,
  // otherwise session creation can't find the signer and falls through
  // to the external bridge, which fails with "No wallet found with
  // connected address".
  useEffect(() => {
    if (parent && !window.keychain_wallets) {
      window.keychain_wallets = new KeychainWallets(parent);
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

  const availableWallets = useMemo<ExternalWalletType[]>(() => {
    return wallets
      .filter((wallet) => wallet.available === true)
      .map((wallet) => wallet.type);
  }, [wallets]);

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
      availableWallets,
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
      availableWallets,
    ],
  );

  return (
    <WalletsContext.Provider value={value}>{children}</WalletsContext.Provider>
  );
};
