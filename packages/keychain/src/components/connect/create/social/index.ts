import { TurnkeyWallet } from "@/wallets/social/turnkey";
import { SocialProvider } from "@/wallets/social/turnkey_utils";
import { WalletAdapter } from "@cartridge/controller";
import { useCallback } from "react";

export const useSocialAuthentication = (
  setChangeWallet?: (changeWallet: boolean) => void,
) => {
  const signup = useCallback(
    async (socialProvider: SocialProvider, signupUsername?: string) => {
      const turnkeyWallet = new TurnkeyWallet(socialProvider);
      const { account, error } = await turnkeyWallet.connect(signupUsername);
      if (error?.includes("Account mismatch")) {
        setChangeWallet?.(true);
        return;
      }
      if (!account) {
        throw new Error(error || "Unknown error trying to connect to Turnkey");
      }

      window.keychain_wallets?.addEmbeddedWallet(
        account,
        turnkeyWallet as unknown as WalletAdapter,
      );

      return { address: account, signer: { eip191: { address: account } } };
    },
    [setChangeWallet],
  );

  return { signup, login: signup };
};
