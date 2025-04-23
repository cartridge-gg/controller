import { DEFAULT_SESSION_DURATION, now } from "@/const";
import { useConnection } from "@/hooks/connection";
import { useWallets } from "@/hooks/wallets";
import {
  ExternalWalletResponse,
  ExternalWalletType,
} from "@cartridge/controller";
import { AccountQuery } from "@cartridge/utils/api/cartridge";
import { useCallback } from "react";
import { AuthenticationMethod } from "../../types";
import { createController, SignupResponse } from "../useCreateController";

export const useExternalWalletAuthentication = () => {
  const { origin, chainId, rpcUrl, setController } = useConnection();
  const { connectWallet } = useWallets();

  const signup = useCallback(
    async (
      _: string,
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
      };
    },
    [],
  );

  const login = useCallback(
    async (account: AccountQuery["account"]) => {
      if (!origin || !chainId || !rpcUrl) throw new Error("No connection");
      if (!account) throw new Error("No account found");

      const { username, credentials, controllers } = account ?? {};
      const { id: credentialId, publicKey } = credentials?.webauthn?.[0] ?? {};

      const controllerNode = controllers?.edges?.[0]?.node;

      if (!credentialId)
        throw new Error("No credential ID found for this account");

      if (!controllerNode || !publicKey) {
        return;
      }

      const controller = await createController(
        origin,
        chainId,
        rpcUrl,
        username,
        controllerNode.constructorCalldata[0],
        controllerNode.address,
        credentialId,
        publicKey,
      );

      await controller.login(now() + DEFAULT_SESSION_DURATION);

      window.controller = controller;
      setController(controller);
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
