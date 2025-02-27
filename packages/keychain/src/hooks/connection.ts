import { AsyncMethodReturns } from "@cartridge/penpal";
import { useContext, useState, useEffect, useCallback } from "react";
import {
  connectToController,
  ConnectionCtx,
  OpenSettingsCtx,
} from "#utils/connection";
import { isIframe, normalizeOrigin } from "@cartridge/utils";
import {
  ResponseCodes,
  toArray,
  toSessionPolicies,
} from "@cartridge/controller";
import {
  ConnectionContext,
  ConnectionContextValue,
  VerifiableControllerTheme,
} from "#components/provider/connection";
import { Policies } from "@cartridge/presets";
import { defaultTheme, controllerConfigs } from "@cartridge/presets";
import { ParsedSessionPolicies, parseSessionPolicies } from "./session";
import { useThemeEffect } from "@cartridge/ui-next";

type ParentMethods = AsyncMethodReturns<{ close: () => Promise<void> }>;

export function useConnectionValue() {
  const [parent, setParent] = useState<ParentMethods>();
  const [context, setContext] = useState<ConnectionCtx>();
  const [origin, setOrigin] = useState<string>(window.location.origin);
  const [rpcUrl, setRpcUrl] = useState<string>(
    import.meta.env.VITE_RPC_SEPOLIA,
  );
  const [policies, setPolicies] = useState<ParsedSessionPolicies>();
  const [theme, setTheme] = useState<VerifiableControllerTheme>({
    verified: true,
    ...defaultTheme,
  });
  const [controller, setController] = useState(window.controller);
  const [hasPrefundRequest, setHasPrefundRequest] = useState<boolean>(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const rpcUrl = urlParams.get("rpc_url");

    // if we're not embedded (eg Slot auth/session) load controller from store and set origin/rpcUrl
    if (!isIframe()) {
      if (controller) {
        setController(controller);
      }

      if (rpcUrl) {
        setRpcUrl(rpcUrl);
      }

      // if (controller && rpcUrl) {
      //   controller.switchChain(rpcUrl);
      // }
    }

    // Handle theme and policies
    const policiesParam = urlParams.get("policies");
    const themeParam = urlParams.get("theme");
    const presetParam = urlParams.get("preset");

    if (themeParam) {
      const decodedPreset = decodeURIComponent(themeParam);
      if (controllerConfigs[decodedPreset].theme) {
        setTheme({
          ...controllerConfigs[decodedPreset].theme,
          verified: true,
        });
      } else {
        console.error("Theme preset not valid");
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
        !!origin &&
        allowedOrigins.some((allowedOrigin) => {
          const originUrl = new URL(origin);
          return originUrl.hostname === allowedOrigin;
        });

      if (controllerConfigs[presetParam].theme) {
        setTheme({
          verified,
          ...controllerConfigs[presetParam].theme,
        });
      }

      // Set policies from preset if no URL policies
      if (!policiesParam && controllerConfigs[presetParam].policies) {
        setPolicies(
          parseSessionPolicies({
            verified,
            policies: controllerConfigs[presetParam].policies,
          }),
        );
      }
    }
  }, [
    origin,
    controller,
    setTheme,
    setPolicies,
    setHasPrefundRequest,
    setController,
  ]);

  useThemeEffect({ theme, assetUrl: "" });

  useEffect(() => {
    const connection = connectToController<ParentMethods>({
      setRpcUrl,
      setContext,
      setController,
    });
    connection.promise.then((parent) => {
      setOrigin(normalizeOrigin(parent.origin));
      setParent(parent);
    });

    return () => {
      connection.destroy();
    };
  }, [setOrigin, setRpcUrl, setContext, setController]);

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
      type: "open-settings",
      resolve: context.resolve,
      reject: context.reject,
    } as OpenSettingsCtx);
  }, [context]);

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
  }, [context, parent, setContext, logout]);

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

  return {
    context,
    controller,
    origin,
    rpcUrl,
    policies,
    theme,
    hasPrefundRequest,
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

export function useControllerTheme() {
  return useConnection().theme;
}
