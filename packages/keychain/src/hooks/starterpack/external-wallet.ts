import { useState, useCallback } from "react";
import { ExternalPlatform, ExternalWallet } from "@cartridge/controller";
import { useWallets } from "@/hooks/wallets";
import { useConnection } from "../connection";

export interface UseExternalWalletOptions {
  onError?: (error: Error) => void;
}

export interface UseExternalWalletReturn {
  // Wallet state
  selectedWallet: ExternalWallet | undefined;
  selectedPlatform: ExternalPlatform | undefined;
  walletAddress: string | undefined;

  // Actions
  onExternalConnect: (
    wallet: ExternalWallet,
    platform: ExternalPlatform,
    chainId?: string | number,
  ) => Promise<string | undefined>;
  clearSelectedWallet: () => void;
  setSelectedWallet: (wallet: ExternalWallet | undefined) => void;
  setSelectedPlatform: (platform: ExternalPlatform | undefined) => void;

  // Wallet hook state
  walletError: Error | null;
}

/**
 * Hook for managing external wallet connections (Argent, Braavos, etc.)
 */
export function useExternalWallet({
  onError,
}: UseExternalWalletOptions): UseExternalWalletReturn {
  const { controller } = useConnection();
  const { error: walletError, connectWallet, switchChain } = useWallets();

  const [selectedWallet, setSelectedWallet] = useState<
    ExternalWallet | undefined
  >();
  const [selectedPlatform, setSelectedPlatform] = useState<
    ExternalPlatform | undefined
  >();
  const [walletAddress, setWalletAddress] = useState<string | undefined>();

  const clearSelectedWallet = useCallback(() => {
    setSelectedWallet(undefined);
    setSelectedPlatform(undefined);
    setWalletAddress(undefined);
  }, []);

  const onExternalConnect = useCallback(
    async (
      wallet: ExternalWallet,
      platform: ExternalPlatform,
      chainId?: string | number,
    ): Promise<string | undefined> => {
      if (!controller) return;

      try {
        setSelectedWallet(wallet);
        setSelectedPlatform(platform);
        const res = await connectWallet(wallet.type);
        if (!res?.success) {
          const error = new Error(
            `Failed to connect to ${wallet.name} - ${res?.error || "Unknown error"}`,
          );
          throw error;
        }

        setWalletAddress(res.account);

        if (chainId) {
          if (wallet.type === "braavos") {
            console.warn(
              "Braavos does not support `wallet_switchStarknetChain`",
            );
          } else {
            const res = await switchChain(wallet.type, chainId.toString());
            if (!res) {
              const error = new Error(
                `${wallet.name} failed to switch chain (${chainId})`,
              );
              throw error;
            }
          }
        }

        return res.account;
      } catch (e) {
        onError?.(e as Error);
        throw e;
      }
    },
    [controller, connectWallet, switchChain, onError],
  );

  return {
    selectedWallet,
    selectedPlatform,
    walletAddress,
    onExternalConnect,
    clearSelectedWallet,
    setSelectedWallet,
    setSelectedPlatform,
    walletError,
  };
}
