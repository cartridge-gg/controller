import { AsyncMethodReturns } from "@cartridge/penpal";
import {
  useContext,
  createContext,
  useState,
  useEffect,
  PropsWithChildren,
  useCallback,
  useMemo,
} from "react";
import Controller from "utils/controller";
import {
  connectToController,
  ConnectionCtx,
  LogoutCtx,
  SetDelegateCtx,
  ExecuteCtx,
} from "utils/connection";
import { RpcProvider, CallData, constants, shortString } from "starknet";
import { Policy, Prefund, ResponseCodes } from "@cartridge/controller";
import { mergeDefaultETHPrefund } from "utils/token";
import { isIframe } from "components/connect/utils";

const ConnectionContext = createContext<ConnectionContextValue>(undefined);

type ConnectionContextValue = {
  context: ConnectionCtx;
  controller: Controller;
  origin: string;
  rpcUrl: string;
  chainId: string;
  chainName: string;
  policies: Policy[];
  prefunds: Prefund[];
  hasPrefundRequest: boolean;
  error: Error;
  setContext: (context: ConnectionCtx) => void;
  setController: (controller: Controller) => void;
  cancel: () => void;
  logout: (context: ConnectionCtx) => void;
  setDelegate: (context: ConnectionCtx) => void;
  setDelegateTransaction: (
    context: ConnectionCtx,
    delegateAddress: string,
  ) => void;
};

export function ConnectionProvider({ children }: PropsWithChildren) {
  const [parent, setParent] = useState<ParentMethods>();
  const [context, setContext] = useState<ConnectionCtx>();
  const [origin, setOrigin] = useState<string>();
  const [rpcUrl, setRpcUrl] = useState<string>();
  const [chainId, setChainId] = useState<string>();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [controller, setController] = useState<Controller | undefined>();
  const [prefunds, setPrefunds] = useState<Prefund[]>([]);
  const [hasPrefundRequest, setHasPrefundRequest] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  const chainName = useMemo(() => {
    if (!chainId) {
      return;
    }

    switch (chainId) {
      case constants.StarknetChainId.SN_MAIN:
        return "Mainnet";
      case constants.StarknetChainId.SN_SEPOLIA:
        return "Sepolia";
      default:
        return shortString.decodeShortString(chainId);
    }
  }, [chainId]);

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

    // Set rpc and origin if we're not embedded (eg Slot auth/session)
    if (!isIframe()) {
      setOrigin(urlParams.get("origin") || process.env.NEXT_PUBLIC_ORIGIN);
      setRpcUrl(
        urlParams.get("rpc_url") || process.env.NEXT_PUBLIC_RPC_SEPOLIA,
      );
    }

    const prefundParam = urlParams.get("prefunds");
    const prefunds: Prefund[] = prefundParam
      ? JSON.parse(decodeURIComponent(prefundParam))
      : [];
    setHasPrefundRequest(!!prefundParam);
    setPrefunds(mergeDefaultETHPrefund(prefunds));
    setPolicies(parsePolicies(urlParams.get("policies")));

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
      const update = async () => {
        try {
          let provider = new RpcProvider({ nodeUrl: rpcUrl });
          let chainId = await provider.getChainId();
          setChainId(chainId);

          controller?.updateChain(rpcUrl, chainId);
        } catch (e) {
          console.error(e);
          setError(new Error("Unable to fetch Chain ID from provided RPC URL"));
        }
      };

      update();
    }
  }, [rpcUrl, controller]);

  const logout = useCallback((context: ConnectionCtx) => {
    setContext({
      origin: context.origin,
      type: "logout",
      resolve: context.resolve,
      reject: context.reject,
    } as LogoutCtx);
  }, []);

  const setDelegate = useCallback((context: ConnectionCtx) => {
    setContext({
      origin: context.origin,
      type: "set-delegate",
      resolve: context.resolve,
      reject: context.reject,
    } as SetDelegateCtx);
  }, []);

  const setDelegateTransaction = useCallback(
    (context: ConnectionCtx, delegateAddress: string) => {
      setContext({
        origin: context.origin,
        transactions: [
          {
            contractAddress: controller.address,
            entrypoint: "set_delegate_account",
            calldata: CallData.compile([delegateAddress]),
          },
        ],
        transactionsDetail: {},
        type: "execute",
        resolve: context.resolve,
        reject: context.reject,
      } as ExecuteCtx);
    },
    [controller?.address],
  );

  return (
    <ConnectionContext.Provider
      value={{
        context,
        controller,
        origin,
        rpcUrl,
        chainId,
        chainName,
        policies,
        prefunds,
        hasPrefundRequest,
        error,
        setController,
        setContext,
        cancel,
        logout,
        setDelegate,
        setDelegateTransaction,
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
