import { ExternalWalletResponse, WalletAdapter } from "@cartridge/controller";
import { useCallback } from "react";

export const useSocialAuthentication = (
  setChangeWallet?: (changeWallet: boolean) => void,
) => {
  const signup = useCallback(
    async (signupOrLogin: { username: string } | { address: string }) => {
      const { success, account, error } =
        (await window.keychain_wallets?.turnkeyWallet.connect(
          signupOrLogin,
        )) as ExternalWalletResponse;
      if (error?.includes("Account mismatch")) {
        setChangeWallet?.(true);
        return;
      }
      if (!success) {
        throw new Error("Failed to connect to Turnkey: " + error);
      }
      if (!account) {
        throw new Error("No account found");
      }

      window.keychain_wallets?.addEmbeddedWallet(
        account,
        window.keychain_wallets?.turnkeyWallet as WalletAdapter,
      );

      return { address: account, signer: { eip191: { address: account } } };
    },
    [setChangeWallet],
  );

  return { signup, login: signup };
};
