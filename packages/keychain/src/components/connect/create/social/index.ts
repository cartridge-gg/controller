import { useConnection } from "@/hooks/connection";
import { OAuthWallet } from "@/wallets/social/turnkey";
import { SocialProvider } from "@/wallets/social/turnkey_utils";
import { WalletAdapter } from "@cartridge/controller";
import { useCallback } from "react";

export const useSocialAuthentication = (
  setChangeWallet?: (changeWallet: boolean) => void,
) => {
  const { chainId, rpcUrl } = useConnection();

  const signup = useCallback(
    async (
      socialProvider: SocialProvider,
      username: string,
      isSignup: boolean,
    ) => {
      if (!chainId) {
        throw new Error("No chainId");
      }

      const oauthWallet = new OAuthWallet(
        username,
        chainId,
        rpcUrl,
        socialProvider,
      );
      const { account, error, success } = await oauthWallet.connect(isSignup);
      if (error?.includes("Account mismatch")) {
        setChangeWallet?.(true);
        return;
      }
      if (!account && error) {
        throw new Error(error || "Unknown error trying to connect to Turnkey");
      }

      if (!account && !error && !success) {
        return;
      }

      if (!account) {
        throw new Error("No account found");
      }
      if (!window.keychain_wallets) {
        throw new Error("No keychain_wallets found");
      }

      window.keychain_wallets.addEmbeddedWallet(
        account,
        oauthWallet as unknown as WalletAdapter,
      );

      return {
        address: account,
        signer: { eip191: { address: account } },
        type: socialProvider,
      };
    },
    [setChangeWallet, chainId, rpcUrl],
  );

  return {
    signup: (socialProvider: SocialProvider, username: string) =>
      signup(socialProvider, username, true),
    login: (socialProvider: SocialProvider, username: string) =>
      signup(socialProvider, username, false),
  };
};
