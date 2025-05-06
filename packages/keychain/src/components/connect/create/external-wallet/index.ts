import { useConnection } from "@/hooks/connection";
import { useWallets } from "@/hooks/wallets";
import {
  ExternalWalletResponse,
  ExternalWalletType,
} from "@cartridge/controller";
import {
  ControllerQuery,
  Eip191Credential,
} from "@cartridge/utils/api/cartridge";
import { useCallback } from "react";
import { AuthenticationMethod } from "../../types";
import { SignupResponse } from "../useCreateController";

export const useExternalWalletAuthentication = () => {
  const { origin, chainId, rpcUrl, setController } = useConnection();
  const { connectWallet } = useWallets();

  const signup = useCallback(
    async (
      authenticationMode: AuthenticationMethod,
    ): Promise<SignupResponse> => {
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
      );

      if (!connectedWallet || !connectedWallet.account)
        throw new Error("No wallet found for address: " + address);

      if (connectedWallet.account !== address) {
        // TODO(tedison) this might be the place where we want to
        // set the change wallet message instead of throwing an error
        throw new Error("Switch to the correct wallet");
      }

      return {
        signer: walletToSigner(connectedWallet),
      };
    },
    [chainId, rpcUrl, origin, setController],
  );

  return { signup, login };
};

const walletToSigner = (wallet: ExternalWalletResponse) => {
  if (wallet.wallet !== "metamask" && wallet.wallet !== "rabby") {
    throw new Error("Unsupported wallet");
  }
  return {
    eip191: { address: wallet.account! },
  };
};
