import { AsyncMethodReturns } from "@cartridge/penpal";
import {
  useContext,
  createContext,
  useState,
  useEffect,
  PropsWithChildren,
  useCallback,
} from "react";
import Controller from "utils/controller";
import { connectToController, ConnectionCtx } from "utils/connection";
import { isIframe } from "components/connect/utils";
import { RpcProvider } from "starknet";

const ConnectionContext = createContext<ConnectionContextValue>(undefined);

type ConnectionContextValue = {
  controller: Controller;
  setController: (controller: Controller) => void;
  context: ConnectionCtx;
  setContext: (context: ConnectionCtx) => void;
  rpcUrl: string;
  error: Error;
  chainId: string;
  close: () => void;
};

export function ConnectionProvider({ children }: PropsWithChildren) {
  const [parent, setParent] = useState<ParentMethods>();
  const [context, setContext] = useState<ConnectionCtx>();
  const [rpcUrl, setRpcUrl] = useState<string>();
  const [chainId, setChainId] = useState<string>();
  const [controller, setController] = useState(Controller.fromStore);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    if (!isIframe()) {
      const urlParams = new URLSearchParams(window.location.search);
      setRpcUrl(
        urlParams.get("rpc_url") || process.env.NEXT_PUBLIC_RPC_SEPOLIA,
      );
      return;
    }

    const connection = connectToController({
      setRpcUrl,
      setContext,
      setController,
    });
    connection.promise.then((parent) =>
      setParent(parent as unknown as ParentMethods),
    );

    return () => {
      connection.destroy();
    };
  }, []);

  useEffect(() => {
    if (rpcUrl) {
      new RpcProvider({ nodeUrl: rpcUrl })
        .getChainId()
        .then(setChainId)
        .catch(() => {
          setError(new Error("Unable to fetch Chain ID from provided RPC URL"));
        });
    }
  }, [rpcUrl]);

  const close = useCallback(async () => {
    if (!parent) return;

    try {
      await parent.close();
    } catch (e) {
      // Always fails for some reason
    }
  }, [parent]);

  return (
    <ConnectionContext.Provider
      value={{
        controller,
        setController,
        rpcUrl,
        chainId,
        error,
        context,
        setContext,
        close,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

type ParentMethods = AsyncMethodReturns<{ close: () => Promise<void> }>;

export function useConnection() {
  const ctx = useContext<ConnectionContextValue>(ConnectionContext);
  if (!ctx) {
    throw new Error("ConnectionProvider must be placed");
  }

  return ctx;
}
