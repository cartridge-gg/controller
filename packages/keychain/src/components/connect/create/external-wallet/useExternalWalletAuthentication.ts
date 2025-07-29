import { useConnection } from "@/hooks/connection";
import { useWallets } from "@/hooks/wallets";
import {
  AuthOption,
  ExternalWalletResponse,
  ExternalWalletType,
} from "@cartridge/controller";
import { ControllerQuery } from "@cartridge/ui/utils/api/cartridge";
import { getAddress } from "ethers";
import { useCallback } from "react";
import { SignupResponse } from "../useCreateController";

export const useExternalWalletAuthentication = () => {
  const { origin, chainId, rpcUrl } = useConnection();
  const { connectWallet } = useWallets();

  const signup = useCallback(
    async (authenticationMode: AuthOption): Promise<SignupResponse> => {
      const connectedWallet = await connectWallet(
        authenticationMode as ExternalWalletType,
      );
      if (!connectedWallet || !connectedWallet.account)
        throw new Error("No wallet found");
      return {
        address: connectedWallet.account,
        signer: walletToSigner(connectedWallet),
        type: authenticationMode,
      };
    },
    [connectWallet],
  );

  const login = useCallback(
    async (
      controller: ControllerQuery["controller"],
      provider: ExternalWalletType,
    ) => {
      if (!origin || !chainId || !rpcUrl) throw new Error("No connection");
      if (!controller) throw new Error("No controller found");

      const connectedWallet = await connectWallet(provider);

      if (!connectedWallet || !connectedWallet.account)
        throw new Error(
          "No wallet found for address: " + connectedWallet?.account,
        );

      return {
        signer: walletToSigner(connectedWallet),
      };
    },
    [chainId, rpcUrl, origin, connectWallet],
  );

  return { signup, login };
};

const walletToSigner = (wallet: ExternalWalletResponse) => {
  if (wallet.wallet !== "metamask" && wallet.wallet !== "rabby") {
    throw new Error("Unsupported wallet");
  }
  return {
    eip191: { address: getAddress(wallet.account!) },
  };
};
