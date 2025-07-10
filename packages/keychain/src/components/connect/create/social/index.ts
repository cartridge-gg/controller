import { TurnkeyWallet } from "@/wallets/social/turnkey";
import { WalletAdapter } from "@cartridge/controller";
import { useCallback } from "react";

export const useSocialAuthentication = (
  setChangeWallet?: (changeWallet: boolean) => void,
) => {
  const signup = useCallback(
    async (signupUsername?: string) => {
      const turnkeyWallet = new TurnkeyWallet();
      const { account, error } = await turnkeyWallet.connect(signupUsername);
      if (error?.includes("Account mismatch")) {
        setChangeWallet?.(true);
        return;
      }
      if (!account) {
        throw new Error("No account found");
      }

      window.keychain_wallets?.addEmbeddedWallet(
        account,
        turnkeyWallet as WalletAdapter,
      );

      return { address: account, signer: { eip191: { address: account } } };
    },
    [setChangeWallet],
  );

  return { signup, login: signup };
};
