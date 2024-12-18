import { AsyncMethodReturns } from "@cartridge/penpal";
import { useContext, useState, useEffect, useCallback, useMemo } from "react";
import Controller from "utils/controller";
import {
  connectToController,
  ConnectionCtx,
  OpenSettingsCtx,
} from "utils/connection";
import { getChainName, isIframe } from "@cartridge/utils";
import { RpcProvider } from "starknet";
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
import { Policies } from "@cartridge/presets";
import {
  defaultTheme,
  controllerConfigs,
  ControllerTheme,
} from "@cartridge/presets";
import { ParsedSessionPolicies, parseSessionPolicies } from "./session";

type ParentMethods = AsyncMethodReturns<{ close: () => Promise<void> }>;

export function useConnectionValue() {
  const [parent, setParent] = useState<ParentMethods>();
  const [context, setContext] = useState<ConnectionCtx>();
  const [origin, setOrigin] = useState<string>();
  const [rpcUrl, setRpcUrl] = useState<string>();
  const [chainId, setChainId] = useState<string>();
  const [policies, setPolicies] = useState<ParsedSessionPolicies>();
  const [theme, setTheme] = useState<ControllerTheme>(defaultTheme);
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
    if (controller) {
      posthog.identify(controller.username(), {
        address: controller.address,
        class: controller.classHash(),
        chainId: controller.chainId,
      });
    } else {
      posthog.reset();
    }

    setControllerRaw(controller);
    setIsSignedUp();
  }, []);

  useEffect(() => {
    if (origin) {
      posthog.group("company", origin);
    }
  }, [origin]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    // Set rpc and origin if we're not embedded (eg Slot auth/session)
    if (!isIframe()) {
      setOrigin(urlParams.get("origin") || process.env.NEXT_PUBLIC_ORIGIN);
      setRpcUrl(
        urlParams.get("rpc_url") || process.env.NEXT_PUBLIC_RPC_SEPOLIA,
      );
    }

    // Handle prefunds
    const prefundParam = urlParams.get("prefunds");
    const prefunds: Prefund[] = prefundParam
      ? JSON.parse(decodeURIComponent(prefundParam))
      : [];
    setHasPrefundRequest(!!prefundParam);
    setPrefunds(mergeDefaultETHPrefund(prefunds));

    // Handle theme and policies
    const policiesParam = urlParams.get("policies");
    const themeParam = urlParams.get("theme");
    const presetParam = urlParams.get("preset");

    // Provides backward compatability for Controler <= v0.5.1
    if (themeParam) {
      const decodedPreset = decodeURIComponent(themeParam);
      try {
        const parsedTheme = JSON.parse(decodedPreset) as ControllerTheme;
        setTheme(parsedTheme);
      } catch (e) {
        setTheme(controllerConfigs[decodedPreset].theme || defaultTheme);
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
    if (
      presetParam &&
      presetParam in controllerConfigs
      // TODO: Reenable
      //  &&
      // origin &&
      // (origin.startsWith("http://localhost") ||
      //   toArray(controllerConfigs[presetParam].origin).includes(origin))
    ) {
      setTheme(controllerConfigs[presetParam].theme || defaultTheme);

      // Set policies from preset if no URL policies
      if (!policiesParam && controllerConfigs[presetParam].policies) {
        setPolicies(
          parseSessionPolicies({
            verified: true,
            policies: controllerConfigs[presetParam].policies,
          }),
        );
      }
    }
  }, [setTheme, setPolicies, setHasPrefundRequest, setOrigin, setPrefunds]);

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
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    if (rpcUrl) {
      const update = async () => {
        try {
          let provider = new RpcProvider({ nodeUrl: rpcUrl });
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
