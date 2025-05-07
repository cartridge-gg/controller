import {
  ConnectionContext,
  ConnectionContextValue,
  VerifiableControllerTheme,
} from "@/components/provider/connection";
import {
  ConnectionCtx,
  connectToController,
  OpenSettingsCtx,
} from "@/utils/connection";
import {
  AuthOption,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
  ResponseCodes,
  toArray,
  toSessionPolicies,
} from "@cartridge/controller";
import { AsyncMethodReturns } from "@cartridge/penpal";
import { controllerConfigs, defaultTheme, Policies } from "@cartridge/presets";
import { useThemeEffect } from "@cartridge/ui-next";
import { isIframe, normalizeOrigin } from "@cartridge/utils";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { RpcProvider, shortString } from "starknet";
import { ParsedSessionPolicies, parseSessionPolicies } from "./session";

export type ParentMethods = AsyncMethodReturns<{
  close: () => Promise<void>;
  closeAll: () => Promise<void>;
  reload: () => Promise<void>;

  // Wallet bridge methods
  externalDetectWallets: () => Promise<ExternalWallet[]>;
  externalConnectWallet: (
    type: ExternalWalletType,
    address?: string,
  ) => Promise<ExternalWalletResponse>;
  externalSignTypedData: (
    identifier: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
  ) => Promise<ExternalWalletResponse>;
  externalSignMessage: (
    identifier: string,
    message: string,
  ) => Promise<ExternalWalletResponse>;
  externalSendTransaction: (
    identifier: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    txn: any,
  ) => Promise<ExternalWalletResponse>;
  externalGetBalance: (
    identifier: string,
    tokenAddress?: string,
  ) => Promise<ExternalWalletResponse>;
}>;

export function useConnectionValue() {
  const [parent, setParent] = useState<ParentMethods>();
  const [context, setContext] = useState<ConnectionCtx>();
  const [origin, setOrigin] = useState<string>(window.location.origin);
  const [rpcUrl, setRpcUrl] = useState<string>(
    import.meta.env.VITE_RPC_SEPOLIA,
  );
  const [policies, setPolicies] = useState<ParsedSessionPolicies>();
  const [verified, setVerified] = useState<boolean>(false);
  const [theme, setTheme] = useState<VerifiableControllerTheme>({
    verified: true,
    ...defaultTheme,
  });
  const [configSignupOptions, setConfigSignupOptions] = useState<
    AuthOption[] | undefined
  >();
  const [controller, setController] = useState(window.controller);
  const [chainId, setChainId] = useState<string>();

  const urlParams = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get("theme");
    const preset = urlParams.get("preset");
    const rpcUrl = urlParams.get("rpc_url");
    const policies = urlParams.get("policies");

    if (rpcUrl) {
      setRpcUrl(rpcUrl);
    }

    return { theme, preset, policies };
  }, []);

  // Fetch chain ID from RPC provider when rpcUrl changes
  useEffect(() => {
    const fetchChainId = async () => {
      try {
        const provider = new RpcProvider({ nodeUrl: rpcUrl });
        const id = await provider.getChainId();
        setChainId(id);
      } catch (e) {
        console.error("Failed to fetch chain ID:", e);
      }
    };

    if (rpcUrl) {
      fetchChainId();
    }
  }, [rpcUrl]);

  // Handle controller initialization
  useEffect(() => {
    // if we're not embedded (eg Slot auth/session) load controller from store and set origin/rpcUrl
    if (!isIframe()) {
      if (controller) {
        setController(controller);
      }
    }
  }, [controller]);

  // Check if preset is verified for the current origin, supporting wildcards
  useEffect(() => {
    if (
      !urlParams.preset ||
      !controllerConfigs?.[urlParams.preset] ||
      !controllerConfigs?.[urlParams.preset]?.origin
    ) {
      return;
    }

    const allowedOrigins = toArray(controllerConfigs[urlParams.preset].origin);
    setVerified(isOriginVerified(origin, allowedOrigins));
  }, [origin, urlParams]);

  // Handle theme configuration
  useEffect(() => {
    const { preset, theme: urlTheme } = urlParams;

    if (urlTheme) {
      try {
        const decodedPreset = decodeURIComponent(urlTheme);
        if (controllerConfigs?.[decodedPreset]?.theme) {
          setTheme({
            ...controllerConfigs[decodedPreset].theme,
            verified,
          });
        } else {
          console.error("Theme preset not valid");
        }
      } catch (e) {
        console.error("Failed to decode theme preset:", e);
      }
    } else if (preset && controllerConfigs?.[preset]?.theme) {
      setTheme({
        verified,
        ...controllerConfigs[preset].theme,
      });
    }
  }, [urlParams, verified]);

  // Handle policies configuration
  useEffect(() => {
    const { policies, preset } = urlParams;

    // URL policies take precedence over preset policies
    if (policies) {
      try {
        const parsedPolicies = JSON.parse(
          decodeURIComponent(policies),
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
    } else if (chainId && preset && controllerConfigs?.[preset]?.chains) {
      try {
        const decodedChainId = shortString.decodeShortString(chainId);
        const presetChains = controllerConfigs[preset].chains;

        if (presetChains?.[decodedChainId]?.policies) {
          // Set policies from preset if no URL policies
          setPolicies(
            parseSessionPolicies({
              verified,
              policies: presetChains[decodedChainId].policies,
            }),
          );
        }
      } catch (e) {
        console.error("Failed to process chain policies:", e);
      }
    }
  }, [urlParams, chainId, verified]);

  useThemeEffect({ theme, assetUrl: "" });

  useEffect(() => {
    const connection = connectToController<ParentMethods>({
      setRpcUrl,
      setContext,
      setController,
      setConfigSignupOptions,
    });

    connection.promise
      .then((parentConnection) => {
        setOrigin(normalizeOrigin(parentConnection.origin));
        setParent(parentConnection);
      })
      .catch((error) => {
        console.error("Penpal connection failed:", error);
      });

    return () => {
      connection.destroy();
    };
  }, [setOrigin, setRpcUrl, setContext, setController, setConfigSignupOptions]);

  const logout = useCallback(async () => {
    if (!parent || !context?.resolve) return;

    try {
      await window.controller?.disconnect();
      parent.closeAll();
      parent.reload();

      context.resolve({
        code: ResponseCodes.NOT_CONNECTED,
        message: "User logged out",
      });
    } catch (err) {
      console.error("Disconnect failed:", err);
    }
  }, [context, parent, setController]);

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

    context.resolve({
      code: ResponseCodes.CANCELED,
      message: "User aborted",
    });
    setContext(undefined); // clears context
    try {
      await parent.close();
    } catch (e) {
      console.error("Failed to close modal:", e);
    }
  }, [context, parent, setContext]);

  const openModal = useCallback(async () => {
    if (!parent || !context?.resolve) return;

    context.resolve({
      code: ResponseCodes.USER_INTERACTION_REQUIRED,
      message: "User interaction required",
    });
    try {
      await parent.close();
    } catch (e) {
      console.error("Failed to open modal:", e);
    }
  }, [context, parent]);

  const externalDetectWallets = useCallback(() => {
    if (!parent) {
      return Promise.resolve([]);
    }
    return parent.externalDetectWallets().catch((err) => {
      console.error("Failed to detect external wallets:", err);
      return [];
    });
  }, [parent]);

  const externalConnectWallet = useCallback(
    (type: ExternalWalletType, address?: string) => {
      if (!parent) {
        return Promise.reject(new Error("Parent connection not ready."));
      }
      return parent.externalConnectWallet(type, address);
    },
    [parent],
  );

  const externalSignMessage = useCallback(
    (identifier: string, message: string) => {
      if (!parent) {
        return Promise.reject(new Error("Parent not available"));
      }
      return parent.externalSignMessage(identifier, message);
    },
    [parent],
  );

  const externalSignTypedData = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (identifier: string, data: any) => {
      if (!parent) {
        return Promise.reject(new Error("Parent connection not ready."));
      }
      return parent.externalSignTypedData(identifier, data);
    },
    [parent],
  );

  const externalSendTransaction = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (identifier: string, txn: any) => {
      if (!parent) {
        return Promise.reject(new Error("Parent connection not ready."));
      }
      return parent.externalSendTransaction(identifier, txn);
    },
    [parent],
  );

  const externalGetBalance = useCallback(
    (identifier: string, tokenAddress?: string) => {
      if (!parent) {
        return Promise.reject(new Error("Parent connection not ready."));
      }
      return parent.externalGetBalance(identifier, tokenAddress);
    },
    [parent],
  );

  return {
    parent,
    context,
    controller,
    origin,
    rpcUrl,
    policies,
    theme,
    verified,
    chainId,
    configSignupOptions,
    setController,
    setContext,
    closeModal,
    openModal,
    logout,
    openSettings,
    externalDetectWallets,
    externalConnectWallet,
    externalSignMessage,
    externalSignTypedData,
    externalSendTransaction,
    externalGetBalance,
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

/**
 * Checks if a given origin is allowed based on a list of allowed origins, supporting wildcards.
 * @param origin - The origin URL string to check.
 * @param allowedOrigins - An array of allowed origin strings (can include wildcards like *.example.com).
 * @returns True if the origin is verified, false otherwise.
 */
export function isOriginVerified(
  origin: string,
  allowedOrigins: string[],
): boolean {
  // If "*" is an allowed origin, always return true
  if (allowedOrigins.includes("*")) {
    return true;
  }

  if (!origin) {
    return false;
  }
  try {
    const originUrl = new URL(origin);
    const currentHostname = originUrl.hostname;

    return allowedOrigins.some((allowedOrigin) => {
      // Check for wildcard subdomain matching
      if (allowedOrigin.startsWith("*.")) {
        const baseDomain = allowedOrigin.substring(2);
        // Ensure currentHostname ends with .baseDomain (e.g., sub.example.com matches *.example.com)
        // Also ensure it's not just the base domain itself matching the wildcard part
        return (
          currentHostname.endsWith(`.${baseDomain}`) &&
          currentHostname !== baseDomain
        );
      } else {
        // Perform exact hostname match
        return currentHostname === allowedOrigin;
      }
    });
  } catch (e) {
    console.error("Invalid origin URL:", e);
    return false;
  }
}
