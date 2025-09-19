import { SmsWallet } from "@/wallets/social/sms-wallet";
import { AuthOption, WalletAdapter } from "@cartridge/controller";
import { useCallback } from "react";

export const useSmsAuthentication = () => {
  const signup = useCallback(
    async (
      connectType: "signup" | "login" | "add-signer",
      username: string,
    ) => {
      const smsWallet = new SmsWallet(username, connectType);

      const response = await smsWallet.connect();

      if (!response.success || !response.account) {
        throw new Error(response.error);
      }

      if (!window.keychain_wallets) {
        throw new Error("No keychain_wallets found");
      }

      window.keychain_wallets.addEmbeddedWallet(
        response.account,
        smsWallet as unknown as WalletAdapter,
      );

      return {
        address: response.account,
        signer: { eip191: { address: response.account } },
        type: "sms" as AuthOption,
      };
    },
    [],
  );

  return {
    signup: (username: string) => signup("signup", username),
    login: (username: string) => signup("login", username),
  };
};
