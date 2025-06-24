import { ExternalWalletResponse, WalletAdapter } from "@cartridge/controller";
import {
  ControllerQuery,
  Eip191Credentials,
} from "@cartridge/ui/utils/api/cartridge";
import { useCallback } from "react";
import { SignupResponse } from "../useCreateController";

export const useWalletConnectAuthentication = () => {
  const signup = useCallback(async (): Promise<SignupResponse> => {
    const { success, account, error } =
      (await window.keychain_wallets?.walletConnectWallet.connect()) as ExternalWalletResponse;

    if (!success)
      throw new Error("Failed to connect to WalletConnect: " + error);
    if (!account) throw new Error("No account found");

    window.keychain_wallets?.addEmbeddedWallet(
      account,
      window.keychain_wallets?.walletConnectWallet as WalletAdapter,
    );

    return {
      address: account,
      signer: { eip191: { address: account } },
      type: "walletconnect",
    };
  }, []);

  const login = useCallback(
    async (
      controller: ControllerQuery["controller"],
      setChangeWallet: (changeWallet: boolean) => void,
    ) => {
      if (!controller) throw new Error("No controller found");

      const signerAddress = (
        controller.signers?.[0]?.metadata as Eip191Credentials
      )?.eip191?.[0]?.ethAddress;
      if (!signerAddress) throw new Error("No address found");

      const { success, account, error } =
        (await window.keychain_wallets?.walletConnectWallet.connect()) as ExternalWalletResponse;

      if (!success)
        throw new Error("Failed to connect to WalletConnect: " + error);
      if (!account) throw new Error("No account found");

      const address = account;
      if (BigInt(address) !== BigInt(signerAddress)) {
        setChangeWallet(true);
        return;
      }

      window.keychain_wallets?.addEmbeddedWallet(
        address,
        window.keychain_wallets?.walletConnectWallet as WalletAdapter,
      );

      return {
        signer: { eip191: { address } },
      };
    },
    [],
  );

  return { signup, login };
};
