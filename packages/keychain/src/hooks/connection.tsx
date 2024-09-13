import { AsyncMethodReturns } from "@cartridge/penpal";
import { useContext, useState, useEffect, useCallback, useMemo } from "react";
import Controller from "utils/controller";
import {
  connectToController,
  ConnectionCtx,
  LogoutCtx,
  SetDelegateCtx,
  ExecuteCtx,
  SetExternalOwnerCtx,
  OpenSettingsCtx,
  OpenMenuCtx,
} from "utils/connection";
import { getChainName } from "utils/network";
import { RpcProvider, CallData } from "starknet";
import {
  PaymasterOptions,
  Policy,
  Prefund,
  ResponseCodes,
} from "@cartridge/controller";
import { mergeDefaultETHPrefund } from "utils/token";
import { isIframe } from "components/connect/utils";
import { setIsSignedUp } from "utils/cookie";
import {
  ConnectionContext,
  ConnectionContextValue,
} from "components/Provider/connection";

const CHAIN_ID_TIMEOUT = 3000;

type ParentMethods = AsyncMethodReturns<{ close: () => Promise<void> }>;

export function useConnectionValue() {
  const [parent, setParent] = useState<ParentMethods>();
  const [context, setContext] = useState<ConnectionCtx>();
  const [origin, setOrigin] = useState<string>();
  const [rpcUrl, setRpcUrl] = useState<string>();
  const [chainId, setChainId] = useState<string>();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [paymaster, setPaymaster] = useState<PaymasterOptions>();
  const [controller, setControllerRaw] = useState<Controller | undefined>();
  const [prefunds, setPrefunds] = useState<Prefund[]>([]);
  const [hasPrefundRequest, setHasPrefundRequest] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  const chainName = useMemo(() => {
    if (!chainId) {
      return;
    }
    return getChainName(chainId);
  }, [chainId]);

  const parsePolicies = (policiesStr: string | null): Policy[] => {
    if (!policiesStr) return [];
    return JSON.parse(decodeURIComponent(policiesStr));
  };

  const parsePaymaster = (paymasterStr: string | null): PaymasterOptions => {
    if (!paymasterStr) return null;
    return JSON.parse(decodeURIComponent(paymasterStr));
  };

  const closeModal = useCallback(async () => {
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

  const openModal = useCallback(async () => {
    if (!parent) return;

    try {
      context.resolve({
        code: ResponseCodes.USER_INTERACTION_REQUIRED,
        message: "User interaction required",
      });
      await parent.close();
    } catch (e) {
      // Always fails for some reason
    }
  }, [context, parent]);

  const setController = useCallback((controller?: Controller) => {
    setControllerRaw(controller);
    setIsSignedUp();
  }, []);

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
    setPaymaster(parsePaymaster(urlParams.get("paymaster")));

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
  }, [setController]);

  useEffect(() => {
    if (rpcUrl) {
      const update = async () => {
        try {
          let provider = new RpcProvider({ nodeUrl: rpcUrl });
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Chain ID fetch timed out")),
              CHAIN_ID_TIMEOUT,
            ),
          );
          const chainIdPromise = provider.getChainId();
          let chainId = (await Promise.race([
            chainIdPromise,
            timeoutPromise,
          ])) as constants.StarknetChainId;
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

  const openMenu = useCallback((context: ConnectionCtx) => {
    setContext({
      origin: context.origin,
      type: "open-menu",
      resolve: context.resolve,
      reject: context.reject,
    } as OpenMenuCtx);
  }, []);

  const openSettings = useCallback((context: ConnectionCtx) => {
    setContext({
      origin: context.origin,
      type: "open-settings",
      resolve: context.resolve,
      reject: context.reject,
    } as OpenSettingsCtx);
  }, []);

  const setDelegate = useCallback((context: ConnectionCtx) => {
    setContext({
      origin: context.origin,
      type: "set-delegate",
      resolve: context.resolve,
      reject: context.reject,
    } as SetDelegateCtx);
  }, []);

  const setExternalOwner = useCallback((context: ConnectionCtx) => {
    setContext({
      origin: context.origin,
      type: "set-external-owner",
      resolve: context.resolve,
      reject: context.reject,
    } as SetExternalOwnerCtx);
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
        onCancel: () => {
          openSettings(context);
        },
      } as ExecuteCtx);
    },
    [controller?.address, openSettings],
  );

  const setExternalOwnerTransaction = useCallback(
    (context: ConnectionCtx, externalOwnerAddress: string) => {
      setContext({
        origin: context.origin,
        transactions: [
          {
            contractAddress: controller.address,
            entrypoint: "register_external_owner",
            calldata: CallData.compile([externalOwnerAddress]),
          },
        ],
        transactionsDetail: {},
        type: "execute",
        resolve: context.resolve,
        reject: context.reject,
        onCancel: () => {
          openSettings(context);
        },
      } as ExecuteCtx);
    },
    [controller?.address, openSettings],
  );

  const removeExternalOwnerTransaction = useCallback(
    (context: ConnectionCtx, externalOwnerAddress: string) => {
      setContext({
        origin: context.origin,
        transactions: [
          {
            contractAddress: controller.address,
            entrypoint: "remove_external_owner",
            calldata: CallData.compile([externalOwnerAddress]),
          },
        ],
        transactionsDetail: {},
        type: "execute",
        resolve: context.resolve,
        reject: context.reject,
        onCancel: () => {
          openSettings(context);
        },
      } as ExecuteCtx);
    },
    [controller?.address, openSettings],
  );

  return {
    context,
    controller,
    origin,
    rpcUrl,
    chainId,
    chainName,
    policies,
    prefunds,
    paymaster,
    hasPrefundRequest,
    error,
    setController,
    setContext,
    closeModal,
    openModal,
    logout,
    openMenu,
    openSettings,
    setDelegate,
    setDelegateTransaction,
    setExternalOwnerTransaction,
    removeExternalOwnerTransaction,
    setExternalOwner,
  };
}

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
