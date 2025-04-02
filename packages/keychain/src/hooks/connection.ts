import { AsyncMethodReturns, connectToParent } from "@cartridge/penpal";
import { useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  connectToController,
  ConnectionCtx,
  OpenSettingsCtx,
} from "@/utils/connection";
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
} from "@/components/provider/connection";
import {
  ExternalWalletType,
  ExternalWallet,
  ExternalWalletResponse,
} from "@cartridge/controller";
import { Policies } from "@cartridge/presets";
import { defaultTheme, controllerConfigs } from "@cartridge/presets";
import { ParsedSessionPolicies, parseSessionPolicies } from "./session";
import { useThemeEffect } from "@cartridge/ui-next";
import { shortString } from "starknet";
import { RpcProvider } from "starknet";

type ParentMethods = AsyncMethodReturns<{
  close: () => Promise<void>;
  closeAll: () => Promise<void>;
  reload: () => Promise<void>;

  // Wallet bridge methods
  externalDetectWallets: () => Promise<ExternalWallet[]>;
  externalConnectWallet: (
    type: ExternalWalletType,
  ) => Promise<ExternalWalletResponse>;
  externalSignTypedData: (
    type: ExternalWalletType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
  ) => Promise<ExternalWalletResponse>;
  externalSignMessage: (
    type: ExternalWalletType,
    message: string,
  ) => Promise<ExternalWalletResponse>;
  externalSendTransaction: (
    type: ExternalWalletType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    txn: any,
  ) => Promise<ExternalWalletResponse>;
  externalGetBalance: (
    type: ExternalWalletType,
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

  // Check if preset is verified for the current origin
  useEffect(() => {
    if (
      !urlParams.preset ||
      !controllerConfigs?.[urlParams.preset] ||
      !controllerConfigs?.[urlParams.preset]?.origin
    ) {
      return;
    }

    const allowedOrigins = toArray(controllerConfigs[urlParams.preset].origin);
    setVerified(
      !!origin &&
        allowedOrigins.some((allowedOrigin) => {
          try {
            const originUrl = new URL(origin);
            return originUrl.hostname === allowedOrigin;
          } catch (e) {
            console.error("Invalid origin URL:", e);
            return false;
          }
        }),
    );
  }, [origin, urlParams]);

  // Handle theme configuration
  useEffect(() => {
    const { preset, theme: urlTheme } = urlParams;

    if (urlTheme) {
      try {
        const decodedPreset = decodeURIComponent(urlTheme);
        if (controllerConfigs?.[decodedPreset]?.theme) {
          setVerified(true);
          setTheme({
            ...controllerConfigs[decodedPreset].theme,
            verified: true,
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
    if (window.controller?.disconnect) {
      window.controller
        .disconnect()
        .then(() => {
          setController(undefined);

          if (context?.resolve) {
            context.resolve({
              code: ResponseCodes.NOT_CONNECTED,
              message: "User logged out",
            });
          }

          const connection = connectToParent<ParentMethods>({
            methods: {
              close: () => {
                window.location.reload();
              },
            },
          });
          connection.promise.then((parent) => {
            parent.closeAll();
            parent.reload();
          });
        })
        .catch((err) => {
          console.error("Disconnect failed:", err);
        });
    }
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
    (type: ExternalWalletType) => {
      if (!parent) {
        return Promise.reject(new Error("Parent not available"));
      }
      return parent.externalConnectWallet(type);
    },
    [parent],
  );

  const externalSignMessage = useCallback(
    (type: ExternalWalletType, message: string) => {
      if (!parent) {
        return Promise.reject(new Error("Parent not available"));
      }
      return parent.externalSignMessage(type, message);
    },
    [parent],
  );

  const externalSignTypedData = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (type: ExternalWalletType, data: any) => {
      if (!parent) {
        return Promise.reject(new Error("Parent not available"));
      }
      return parent.externalSignTypedData(type, data);
    },
    [parent],
  );

  const externalSendTransaction = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (type: ExternalWalletType, txn: any) => {
      if (!parent) {
        return Promise.reject(new Error("Parent not available"));
      }
      return parent.externalSendTransaction(type, txn);
    },
    [parent],
  );
  const externalGetBalance = useCallback(
    (type: ExternalWalletType, tokenAddress?: string) => {
      if (!parent) {
        return Promise.reject(new Error("Parent not available"));
      }
      return parent.externalGetBalance(type, tokenAddress);
    },
    [parent],
  );

  return {
    context,
    controller,
    origin,
    rpcUrl,
    policies,
    theme,
    verified,
    chainId,
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
