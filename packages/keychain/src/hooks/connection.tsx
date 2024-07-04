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
import {
  connectToController,
  ConnectionCtx,
  LogoutCtx,
} from "utils/connection";
import { isIframe } from "components/connect/utils";
import { RpcProvider } from "starknet";
import { Policy, Prefund, ResponseCodes } from "@cartridge/controller";

const ConnectionContext = createContext<ConnectionContextValue>(undefined);

type ConnectionContextValue = {
  context: ConnectionCtx;
  controller: Controller;
  origin: string;
  rpcUrl: string;
  chainId: string;
  policies: Policy[];
  prefunds: Prefund[];
  error: Error;
  setContext: (context: ConnectionCtx) => void;
  setController: (controller: Controller) => void;
  cancel: () => void;
  logout: (context: ConnectionCtx) => void;
};

export function ConnectionProvider({ children }: PropsWithChildren) {
  const [parent, setParent] = useState<ParentMethods>();
  const [context, setContext] = useState<ConnectionCtx>();
  const [origin, setOrigin] = useState<string>();
  const [rpcUrl, setRpcUrl] = useState<string>();
  const [chainId, setChainId] = useState<string>();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [controller, setController] = useState(Controller.fromStore);
  const [prefunds, setPrefunds] = useState<Prefund[]>([]);
  const [error, setError] = useState<Error>();

  const parsePolicies = (policiesStr: string | null): Policy[] => {
    if (!policiesStr) return [];
    return JSON.parse(policiesStr);
  };

  const cancel = useCallback(async () => {
    if (!parent) return;

    try {
      context.resolve({
        code: ResponseCodes.CANCELED,
        message: "User aborted",
      });
      await parent.close();
    } catch (e) {
      // Always fails for some reason
    }
  }, [context, parent]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setOrigin(urlParams.get("origin") || process.env.NEXT_PUBLIC_ORIGIN);
    setPrefunds(JSON.parse(decodeURIComponent(urlParams.get("prefunds"))));
    setRpcUrl(urlParams.get("rpc_url") || process.env.NEXT_PUBLIC_RPC_SEPOLIA);
    setChainId(urlParams.get("chain_id"));
    setPolicies(parsePolicies(urlParams.get("policies")));

    if (!isIframe()) {
      return;
    }

    const connection = connectToController({
      setOrigin,
      setRpcUrl,
      setPolicies,
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

  const logout = useCallback((context: ConnectionCtx) => {
    setContext({
      origin: context.origin,
      type: "logout",
      resolve: context.resolve,
      reject: context.reject,
    } as LogoutCtx);
  }, []);

  return (
    <ConnectionContext.Provider
      value={{
        context,
        controller,
        origin,
        rpcUrl,
        chainId,
        policies,
        prefunds,
        error,
        setController,
        setContext,
        cancel,
        logout,
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

export function useChainId() {
  const { chainId } = useConnection();
  return chainId;
}

export function useRpcUrl() {
  const { rpcUrl } = useConnection();
  return rpcUrl;
}

export function useOrigin() {
  const { context } = useConnection();
  return context?.origin;
}

export function usePolicies() {
  const { context } = useConnection();
  switch (context?.type) {
    case "connect":
      return context.policies;
    default:
      return [];
  }
}
