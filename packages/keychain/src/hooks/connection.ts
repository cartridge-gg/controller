import { AsyncMethodReturns } from "@cartridge/penpal";
import { useContext, useState, useEffect, useCallback, useMemo } from "react";
import Controller from "@/utils/controller";
import {
  connectToController,
  ConnectionCtx,
  OpenSettingsCtx,
} from "@/utils/connection";
import { getChainName, isIframe } from "@cartridge/utils";
import { RpcProvider } from "starknet";
import {
  ResponseCodes,
  toArray,
  toSessionPolicies,
} from "@cartridge/controller";
import {
  ConnectionContext,
  ConnectionContextValue,
} from "@/components/provider/connection";
import { UpgradeInterface, useUpgrade } from "./upgrade";
import { Policies } from "@cartridge/presets";
import {
  defaultTheme,
  controllerConfigs,
  ControllerTheme,
} from "@cartridge/presets";
import { ParsedSessionPolicies, parseSessionPolicies } from "./session";
import { VerifiableControllerTheme } from "@/context/theme";

type ParentMethods = AsyncMethodReturns<{ close: () => Promise<void> }>;

export function useConnectionValue() {
  const [parent, setParent] = useState<ParentMethods>();
  const [context, setContext] = useState<ConnectionCtx>();
  const [origin, setOrigin] = useState<string>();
  const [rpcUrl, setRpcUrl] = useState<string>(
    import.meta.env.VITE_RPC_SEPOLIA,
  );
  const [chainId, setChainId] = useState<string>();
  const [policies, setPolicies] = useState<ParsedSessionPolicies>();
  const [theme, setTheme] = useState<VerifiableControllerTheme>({
    verified: true,
    ...defaultTheme,
  });
  const [controller, setController] = useState<Controller | undefined>();
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
    } catch {
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
    } catch {
      // Always fails for some reason
    }
  }, [context, parent]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    // if we're not embedded (eg Slot auth/session) load controller from store and set origin/rpcUrl
    if (!isIframe()) {
      const controller = Controller.fromStore(import.meta.env.VITE_ORIGIN!);
      if (controller) {
        setController(controller);
      }

      setOrigin(urlParams.get("origin") || import.meta.env.VITE_ORIGIN);
      const rpcUrl = urlParams.get("rpc_url");
      if (rpcUrl) {
        setRpcUrl(rpcUrl);
      }
    }

    // Handle theme and policies
    const policiesParam = urlParams.get("policies");
    const themeParam = urlParams.get("theme");
    const presetParam = urlParams.get("preset");

    // Provides backward compatability for Controler <= v0.5.1
    if (themeParam) {
      const decodedPreset = decodeURIComponent(themeParam);
      try {
        const parsedTheme = JSON.parse(decodedPreset) as ControllerTheme;
        setTheme({
          ...parsedTheme,
          verified: true,
        });
      } catch (e) {
        if (controllerConfigs[decodedPreset].theme) {
          setTheme({
            ...controllerConfigs[decodedPreset].theme,
            verified: true,
          });
        } else {
          console.error(e);
        }
      }
    }

    // URL policies take precedence over preset policies
    if (policiesParam) {
      try {
        const parsedPolicies = JSON.parse(
          decodeURIComponent(policiesParam),
        ) as Policies;

        setPolicies(
          parseSessionPolicies({
            verified: false,
            policies: toSessionPolicies(parsedPolicies),
          }),
        );
      } catch (e) {
        console.error("Failed to parse policies:", e);
      }
    }

    // Application provided policies take precedence over preset policies.
    if (presetParam && presetParam in controllerConfigs) {
      const allowedOrigins = toArray(controllerConfigs[presetParam].origin);
      const verified =
        origin &&
        allowedOrigins.some((allowedOrigin) => {
          const originUrl = new URL(origin);
          return originUrl.hostname === allowedOrigin;
        });

      if (controllerConfigs[presetParam].theme) {
        setTheme({
          verified: !!verified,
          ...controllerConfigs[presetParam].theme,
        });
      }

      // Set policies from preset if no URL policies
      if (!policiesParam && controllerConfigs[presetParam].policies) {
        setPolicies(
          parseSessionPolicies({
            verified: !!verified,
            policies: controllerConfigs[presetParam].policies,
          }),
        );
      }
    }
  }, [
    origin,
    setTheme,
    setPolicies,
    setHasPrefundRequest,
    setOrigin,
    setController,
  ]);

  useEffect(() => {
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
  }, [setOrigin, setRpcUrl, setPolicies, setContext, setController]);

  useEffect(() => {
    if (rpcUrl) {
      const update = async () => {
        try {
          const provider = new RpcProvider({ nodeUrl: rpcUrl });
          const chainId = await provider.getChainId();
          setChainId(chainId);
        } catch (e) {
          console.error(e);
          setError(
            new Error(`Unable to fetch Chain ID from provided RPC URL: ${e}`),
          );
        }
      };

      update();
    }
  }, [rpcUrl, controller]);

  const logout = useCallback(() => {
    window.controller?.disconnect().then(() => {
      setController(undefined);

      context?.resolve?.({
        code: ResponseCodes.NOT_CONNECTED,
        message: "User logged out",
      });
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
    theme,
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
