import { AsyncMethodReturns } from "@cartridge/penpal";
import { useContext, useState, useEffect, useCallback, useMemo } from "react";
import Controller from "utils/controller";
import {
  connectToController,
  ConnectionCtx,
  OpenSettingsCtx,
} from "utils/connection";
import { getChainName, isIframe } from "@cartridge/utils";
import { RpcProvider, constants } from "starknet";
import {
  Prefund,
  ResponseCodes,
  toSessionPolicies,
} from "@cartridge/controller";
import { mergeDefaultETHPrefund } from "utils/token";
import { setIsSignedUp } from "utils/cookie";
import {
  ConnectionContext,
  ConnectionContextValue,
} from "components/Provider/connection";
import { UpgradeInterface, useUpgrade } from "./upgrade";
import posthog from "posthog-js";
import { Policies, SessionPolicies } from "@cartridge/presets";

const CHAIN_ID_TIMEOUT = 3000;

type ParentMethods = AsyncMethodReturns<{ close: () => Promise<void> }>;

export function useConnectionValue() {
  const [parent, setParent] = useState<ParentMethods>();
  const [context, setContext] = useState<ConnectionCtx>();
  const [origin, setOrigin] = useState<string>();
  const [rpcUrl, setRpcUrl] = useState<string>();
  const [chainId, setChainId] = useState<string>();
  const [policies, setPolicies] = useState<SessionPolicies>({});
  const [controller, setControllerRaw] = useState<Controller | undefined>();
  const [prefunds, setPrefunds] = useState<Prefund[]>([]);
  const [hasPrefundRequest, setHasPrefundRequest] = useState<boolean>(false);
  const upgrade: UpgradeInterface = useUpgrade(controller);
  const [error, setError] = useState<Error>();

  const chainName = useMemo(() => {
    if (!chainId) {
      return;
    }
    return getChainName(chainId);
  }, [chainId]);

  const closeModal = useCallback(async () => {
    if (!parent || !context?.resolve) return;

    try {
      context.resolve({
        code: ResponseCodes.CANCELED,
        message: "User aborted",
      });
      setContext(undefined); // clears context
      await parent.close();
    } catch (e) {
      // Always fails for some reason
    }
  }, [context, parent, setContext]);

  const openModal = useCallback(async () => {
    if (!parent || !context?.resolve) return;

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
    if (controller && controller.cartridge && origin) {
      posthog.identify(controller.cartridge.username(), {
        address: controller.address,
        class: controller.cartridge.classHash,
        chainId: controller.chainId,
        appId: origin,
      });

      posthog.group("company", origin);
    } else {
      posthog.reset();
    }

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
    setPolicies(() => {
      const param = urlParams.get("policies");
      if (!param) return {};

      const policies = JSON.parse(decodeURIComponent(param)) as Policies;
      return toSessionPolicies(policies);
    });

    const connection = connectToController<ParentMethods>({
      setOrigin,
      setRpcUrl,
      setPolicies,
      setContext,
      setController,
    });
    connection.promise.then(setParent);

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
        } catch (e) {
          console.error(e);
          setError(new Error("Unable to fetch Chain ID from provided RPC URL"));
        }
      };

      update();
    }
  }, [rpcUrl, controller]);

  const logout = useCallback(() => {
    window.controller?.disconnect();
    setController(undefined);

    context?.resolve?.({
      code: ResponseCodes.NOT_CONNECTED,
      message: "User logged out",
    });
  }, [context, setController]);

  const openSettings = useCallback(() => {
    if (!context) return;

    setContext({
      origin: context.origin || origin,
      type: "open-settings",
      resolve: context.resolve,
      reject: context.reject,
    } as OpenSettingsCtx);
  }, [origin, context]);

  return {
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
    upgrade,
    setController,
    setContext,
    closeModal,
    openModal,
    logout,
    openSettings,
  };
}

export function useConnection() {
  const ctx = useContext<ConnectionContextValue | undefined>(ConnectionContext);
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
