import { useConnection } from "@/hooks/connection";
import { WalletConnectWallet } from "@cartridge/controller";
import {
  ControllerQuery,
  Eip191Credentials,
} from "@cartridge/ui/utils/api/cartridge";
import {
  EthereumProvider,
  default as Provider,
} from "@walletconnect/ethereum-provider";
import { useCallback, useEffect, useRef, useState } from "react";
import { SignupResponse } from "../useCreateController";
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
          description: "Cartridge Controller, a wallet designed for gamers",
          url: "https://cartridge.gg",
          icons: [
            "https://avatars.githubusercontent.com/u/101216134?s=200&v=4",
          ],
        },
        showQrModal: false,
        chains: [1],
        optionalChains: [1],
        optionalMethods: ["eth_requestAccounts", "personal_sign"],
        methods: [],
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
      ethereumProvider.connect().catch((error) => {
        setOverlay(null);
        reject(error as Error);
        connectionPromiseRef.current = undefined;
      });
      await promise;
    } finally {
      clearTimeout(timeoutId);
    }

    const accounts = await ethereumProvider.request<string[]>({
      method: "eth_requestAccounts",
    });

    const address = accounts[0];

    const wallet = new WalletConnectWallet(ethereumProvider, address);
    window.keychain_wallets?.addEmbeddedWallet(address, wallet);

    connectionPromiseRef.current = undefined;

    return {
      address,
      signer: { eip191: { address } },
      type: "walletconnect",
    };
  }, [ethereumProvider, setOverlay]);

  const login = useCallback(
    async (
      controller: ControllerQuery["controller"],
      setChangeWallet: (changeWallet: boolean) => void,
    ) => {
      if (!origin || !chainId || !rpcUrl) throw new Error("No connection");
      if (!controller) throw new Error("No controller found");
      if (!ethereumProvider) throw new Error("No Ethereum provider");

      const signerAddress = (
        controller.signers?.[0]?.metadata as Eip191Credentials
      )?.eip191?.[0]?.ethAddress;
      if (!signerAddress) throw new Error("No address found");

      connectionPromiseRef.current = promiseWithResolvers();

      const { promise, reject } = connectionPromiseRef.current;

      const timeoutId = setTimeout(() => {
        setOverlay(null);
        reject(new Error("Timeout waiting for WalletConnect connection"));
        connectionPromiseRef.current = undefined;
      }, 120_000);

      try {
        ethereumProvider.connect().catch((error) => {
          setOverlay(null);
          reject(error as Error);
          connectionPromiseRef.current = undefined;
        });
        await promise;
      } finally {
        clearTimeout(timeoutId);
      }

      const accounts = await ethereumProvider.request<string[]>({
        method: "eth_requestAccounts",
      });

      const address = accounts[0];
      if (!accounts.find((a) => BigInt(a) === BigInt(signerAddress))) {
        setChangeWallet(true);
        return;
      }

      const wallet = new WalletConnectWallet(ethereumProvider, address);
      await wallet.connect();
      window.keychain_wallets?.addEmbeddedWallet(address, wallet);

      return {
        signer: { eip191: { address } },
      };
    },
    [chainId, rpcUrl, origin, setController, ethereumProvider],
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
