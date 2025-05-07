import { useConnection } from "@/hooks/connection";
import { useWallets } from "@/hooks/wallets";
import {
  AuthOption,
  ExternalWalletResponse,
  ExternalWalletType,
} from "@cartridge/controller";
import {
  ControllerQuery,
  Eip191Credential,
} from "@cartridge/utils/api/cartridge";
import { useCallback } from "react";
import { SignupResponse } from "../useCreateController";

export const useExternalWalletAuthentication = () => {
  const { origin, chainId, rpcUrl, setController } = useConnection();
  const { connectWallet, wallets } = useWallets();

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
      credential: Eip191Credential | undefined,
    ) => {
      if (!origin || !chainId || !rpcUrl) throw new Error("No connection");
      if (!controller) throw new Error("No controller found");
      if (!credential) throw new Error("No EIP191 credential provided");

      const address = credential?.ethAddress;

      if (!address) {
        throw new Error(
          "Could not extract ethAddress from provided EIP191 credential",
        );
      }

      const connectedWallet = await connectWallet(
        credential.provider as ExternalWalletType,
        address,
      );

      if (!connectedWallet || !connectedWallet.account)
        throw new Error("No wallet found for address: " + address);

      if (BigInt(connectedWallet.account) !== BigInt(address)) {
        return undefined;
      }

      return {
        signer: walletToSigner(connectedWallet),
      };
    },
    [chainId, rpcUrl, origin, setController, wallets],
  );

  return { signup, login };
};

const walletToSigner = (wallet: ExternalWalletResponse) => {
  if (wallet.wallet !== "metamask" && wallet.wallet !== "rabby") {
    throw new Error("Unsupported wallet");
  }
  return {
    eip191: { address: wallet.account!.toLowerCase() },
  };
};
