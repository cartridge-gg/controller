import { DEFAULT_SESSION_DURATION, now } from "@/const";
import { useConnection } from "@/hooks/connection";
import { WalletConnectWallet } from "@cartridge/controller";
import { AccountQuery } from "@cartridge/utils/api/cartridge";
import {
  EthereumProvider,
  default as Provider,
} from "@walletconnect/ethereum-provider";
import { useCallback, useEffect, useRef, useState } from "react";
import { createController, SignupResponse } from "../useCreateController";
import { QRCodeOverlay } from "./qr-code-overlay";

export interface PromiseWithResolvers<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: Error) => void;
}

const REOWN_PROJECT_ID = "9e74c94c62b9f42303d951e0b8375c14";

export const useWalletConnectAuthentication = (
  setOverlay: (overlay: React.ReactNode) => void,
) => {
  const connectionPromiseRef = useRef<
    PromiseWithResolvers<{ chainId: string }> | undefined
  >(promiseWithResolvers());

  const [ethereumProvider, setEthereumProvider] = useState<
    Provider | undefined
  >(undefined);
  const { origin, chainId, rpcUrl, setController } = useConnection();

  useEffect(() => {
    if (ethereumProvider) return;
    (async () => {
      const handleDisplayUri = (uri: string) => {
        setOverlay(
          <QRCodeOverlay
            uri={uri}
            onCancel={() => {
              setOverlay(null);
              connectionPromiseRef.current?.reject(new Error("Cancelled"));
              connectionPromiseRef.current = undefined;
            }}
          />,
        );
      };
      const provider = await EthereumProvider.init({
        projectId: REOWN_PROJECT_ID,
        metadata: {
          name: "Cartridge",
          description: "Cartridge",
          url: "https://cartridge.gg",
          icons: ["https://avatars.githubusercontent.com/u/37784886"],
        },
        showQrModal: false,
        optionalChains: [1],
        methods: ["eth_requestAccounts"],
      });

      await provider.disconnect();

      provider.on("display_uri", handleDisplayUri);
      provider.on("connect", (info: { chainId: string }) => {
        setOverlay(null);
        connectionPromiseRef.current?.resolve(info);
        connectionPromiseRef.current = undefined;
      });
      provider.on("disconnect", () => {
        connectionPromiseRef.current?.reject(
          new Error("WalletConnect disconnected"),
        );
        connectionPromiseRef.current = undefined;
      });

      setEthereumProvider(provider);
    })();
  }, [ethereumProvider, setOverlay, setEthereumProvider]);

  const signup = useCallback(async (): Promise<SignupResponse> => {
    if (!ethereumProvider) throw new Error("No Ethereum provider");

    connectionPromiseRef.current = promiseWithResolvers();

    const { promise, reject } = connectionPromiseRef.current;

    const timeoutId = setTimeout(() => {
      setOverlay(null);
      reject(new Error("Timeout waiting for WalletConnect connection"));
      connectionPromiseRef.current = undefined;
    }, 120_000);

    try {
      ethereumProvider.connect({});
      await promise;
    } finally {
      clearTimeout(timeoutId);
    }

    const accounts = await ethereumProvider.request<string[]>({
      method: "eth_requestAccounts",
    });
    console.log("accounts", accounts);
    const address = accounts[0];

    const wallet = new WalletConnectWallet(ethereumProvider);
    await wallet.connect();
    window.keychain_wallets?.addEmbeddedWallet(address, wallet);

    return {
      address,
      signer: { eip191: { address } },
    };
  }, [ethereumProvider, setOverlay]);

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

function promiseWithResolvers<T>() {
  let resolve: (value: T | PromiseLike<T>) => void;
  let reject: (reason?: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve: resolve!, reject: reject! };
}
