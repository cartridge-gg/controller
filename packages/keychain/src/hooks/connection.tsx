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
    if (isIframe()) {
      return;
    }

    const fetchChainId = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const nodeUrl = urlParams.get("rpcUrl");

      if (!nodeUrl) {
        setError(new Error("rpcUrl is not provided in the query parameters"));
        return;
      }

      try {
        const rpc = new RpcProvider({ nodeUrl });
        setRpcUrl(nodeUrl);
        setChainId(await rpc.getChainId());
      } catch (error) {
        setError(new Error("Unable to fetch Chain ID from provided RPC URL"));
      }
    };

    fetchChainId();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || window.self === window.top) {
      return;
    }

    const connection = connectToController({
      chainId,
      setChainId,
      setContext,
      setController,
    });
    connection.promise.then((parent) =>
      setParent(parent as unknown as ParentMethods),
    );

    return () => {
      connection.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
