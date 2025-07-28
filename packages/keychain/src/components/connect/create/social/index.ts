import { OAuthWallet } from "@/wallets/social/turnkey";
import { SocialProvider } from "@/wallets/social/turnkey_utils";
import { useCallback } from "react";

export const useSocialAuthentication = (
  setChangeWallet?: (changeWallet: boolean) => void,
) => {
  const signup = useCallback(
    async (socialProvider: SocialProvider, signupUsername?: string) => {
      const oauthWallet = new OAuthWallet(socialProvider);
      const { account, error } = await oauthWallet.connect(signupUsername);
      if (error?.includes("Account mismatch")) {
        setChangeWallet?.(true);
        return;
      }
      if (!account) {
        throw new Error("No account found");
      }
      if (!window.keychain_wallets) {
        throw new Error("No keychain_wallets found");
      }

      window.keychain_wallets.addEmbeddedWallet(account, oauthWallet);

      return {
        address: account,
        signer: { eip191: { address: account } },
        type: socialProvider,
      };
    },
    [setChangeWallet],
  );

  return { signup, login: signup };
};
