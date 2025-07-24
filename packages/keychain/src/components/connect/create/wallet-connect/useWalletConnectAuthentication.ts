import { WalletConnectWallet } from "@/wallets/wallet-connect";
import { ExternalWalletResponse, WalletAdapter } from "@cartridge/controller";
import { ControllerQuery } from "@cartridge/ui/utils/api/cartridge";
import { useCallback } from "react";
import { SignupResponse } from "../useCreateController";

export const useWalletConnectAuthentication = () => {
  const signup = useCallback(async (): Promise<SignupResponse> => {
    const walletConnectWallet = new WalletConnectWallet();
    const { success, account, error } =
      (await walletConnectWallet.connect()) as ExternalWalletResponse;

    if (!success)
      throw new Error("Failed to connect to WalletConnect: " + error);
    if (!account) throw new Error("No account found");

    window.keychain_wallets?.addEmbeddedWallet(
      account,
      walletConnectWallet as WalletAdapter,
    );

    return {
      address: account,
      signer: { eip191: { address: account } },
      type: "walletconnect",
    };
  }, []);

  const login = useCallback(
    async (controller: ControllerQuery["controller"]) => {
      if (!controller) throw new Error("No controller found");

      const walletConnectWallet = new WalletConnectWallet();
      const { success, account, error } =
        (await walletConnectWallet.connect()) as ExternalWalletResponse;

      if (!success)
        throw new Error("Failed to connect to WalletConnect: " + error);
      if (!account) throw new Error("No account found");

      window.keychain_wallets?.addEmbeddedWallet(
        account,
        walletConnectWallet as WalletAdapter,
      );

      return {
        signer: { eip191: { address: account } },
      };
    },
    [],
  );

  return { signup, login };
};
