import { fetchController } from "@/components/connect/create/utils";
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
import { TurnkeyWallet } from "@/wallets/social/turnkey";
import { WalletConnectWallet } from "@/wallets/wallet-connect";
import {
  AuthOptions,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
  ResponseCodes,
  toArray,
  toSessionPolicies,
  WalletAdapter,
  WalletBridge,
} from "@cartridge/controller";
import { AsyncMethodReturns } from "@cartridge/penpal";
import {
  ControllerTheme,
  defaultTheme,
  loadConfig,
  Policies,
} from "@cartridge/presets";
import { useThemeEffect } from "@cartridge/ui";
import { isIframe, normalizeOrigin } from "@cartridge/ui/utils";
import { Eip191Credentials } from "@cartridge/ui/utils/api/cartridge";
import { getAddress } from "ethers";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SemVer } from "semver";
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

/**
 * Parses policies from a URL string.
 * @param policiesStr - The encoded policies string from the URL.
 * @returns ParsedSessionPolicies or undefined if parsing fails.
 */
function parseUrlPolicies(
  policiesStr: string | null,
): ParsedSessionPolicies | undefined {
  if (!policiesStr) {
    return undefined;
  }
  try {
    const parsedPolicies = JSON.parse(
      decodeURIComponent(policiesStr),
    ) as Policies;
    return parseSessionPolicies({
      verified: false, // URL policies are not verified by default
      policies: toSessionPolicies(parsedPolicies),
    });
  } catch (e) {
    console.error("Failed to parse URL policies:", e);
    return undefined;
  }
}

/**
 * Retrieves and parses policies from config data for a specific chain.
 * @param configData - The configuration data object.
 * @param chainId - The chain ID to look for.
 * @param verified - Whether the configuration is verified.
 * @returns ParsedSessionPolicies or undefined if not found or parsing fails.
 */
function getConfigChainPolicies(
  configData: Record<string, unknown> | null,
  chainId: string | undefined,
  verified: boolean,
): ParsedSessionPolicies | undefined {
  if (!configData || !chainId) {
    return undefined;
  }

  try {
    const decodedChainId = shortString.decodeShortString(chainId);

    if (
      "chains" in configData &&
      typeof configData.chains === "object" &&
      configData.chains &&
      decodedChainId in (configData.chains as object) &&
      (configData.chains as Record<string, unknown>)[decodedChainId] &&
      typeof (configData.chains as Record<string, unknown>)[decodedChainId] ===
        "object" &&
      "policies" in
        ((configData.chains as Record<string, unknown>)[
          decodedChainId
        ] as object)
    ) {
      const chainConfig = (
        configData.chains as Record<string, Record<string, unknown>>
      )[decodedChainId];
      return parseSessionPolicies({
        verified,
        policies: toSessionPolicies(chainConfig.policies as Policies),
      });
    }
  } catch (e) {
    console.error("Failed to process chain policies from config:", e);
  }
  return undefined;
}

export function useConnectionValue() {
  const [parent, setParent] = useState<ParentMethods>();
  const [context, setContext] = useState<ConnectionCtx>();
  const [origin, setOrigin] = useState<string>(window.location.origin);
  const [rpcUrl, setRpcUrl] = useState<string>(
    import.meta.env.VITE_RPC_SEPOLIA,
  );
  const [policies, setPolicies] = useState<ParsedSessionPolicies>();
  const [verified, setVerified] = useState<boolean>(false);
  const [isConfigLoading, setIsConfigLoading] = useState<boolean>(false);
  const [configData, setConfigData] = useState<Record<string, unknown> | null>(
    null,
  );
  const [theme, setTheme] = useState<VerifiableControllerTheme>({
    verified: true,
    ...defaultTheme,
  });
  const [configSignupOptions, setConfigSignupOptions] = useState<
    AuthOptions | undefined
  >();
  const [controller, setController] = useState(window.controller);
  const [chainId, setChainId] = useState<string>();
  const [controllerVersion, setControllerVersion] = useState<SemVer>();

  const urlParams = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get("theme");
    const preset = window.location.pathname.startsWith("/slot")
      ? "slot"
      : urlParams.get("preset");
    const rpcUrl = urlParams.get("rpc_url");
    const policies = urlParams.get("policies");
    const version = urlParams.get("v");

    if (rpcUrl) {
      setRpcUrl(rpcUrl);
    }

    return { theme, preset, policies, version };
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

  useEffect(() => {
    if (
      !controller?.username() ||
      !chainId ||
      !window ||
      !window.keychain_wallets
    )
      return;

    (async () => {
      try {
        const controllerResponse = await fetchController(
          chainId,
          controller.username(),
          new AbortController().signal,
        );

        if (
          !controllerResponse.controller ||
          !controllerResponse.controller.signers
        ) {
          return;
        }

        const signers = controllerResponse.controller.signers.filter(
          (signer) =>
            signer.metadata.__typename === "Eip191Credentials" &&
            (signer.metadata.eip191?.[0]?.provider === "discord" ||
              signer.metadata.eip191?.[0]?.provider === "walletconnect"),
        );

        if (signers.length === 0) {
          return;
        }

        for (const signer of signers) {
          const ethAddress = (
            signer?.metadata as { eip191?: Array<{ ethAddress: string }> }
          ).eip191?.[0]?.ethAddress;
          if (!ethAddress) {
            throw new Error("No eth address found");
          }
          if (
            window.keychain_wallets!.getEmbeddedWallet(ethAddress) !== undefined
          ) {
            continue;
          }
          const provider = (signer.metadata as Eip191Credentials).eip191?.[0]
            ?.provider;

          if (provider === "walletconnect") {
            const walletConnectWallet = new WalletConnectWallet();
            if (!walletConnectWallet) {
              throw new Error("Embedded WalletConnect wallet not found");
            }
            window.keychain_wallets!.addEmbeddedWallet(
              ethAddress,
              walletConnectWallet as WalletAdapter,
            );
          } else if (provider === "discord") {
            const turnkeyWallet = new TurnkeyWallet();
            if (!turnkeyWallet) {
              throw new Error("Embedded Turnkey wallet not found");
            }

            turnkeyWallet.account = getAddress(ethAddress);
            turnkeyWallet.subOrganizationId = undefined;

            window.keychain_wallets!.addEmbeddedWallet(
              ethAddress,
              turnkeyWallet as WalletAdapter,
            );
          }
        }
      } catch (error) {
        console.error("Failed to add embedded wallet:", error);
      }
    })();
  }, [controller?.username, chainId]);

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
    if (!urlParams.preset) {
      return;
    }

    setIsConfigLoading(true);
    loadConfig(urlParams.preset)
      .then((config) => {
        if (config && config.origin) {
          const allowedOrigins = toArray(config.origin as string | string[]);
          setVerified(isOriginVerified(origin, allowedOrigins));
          setConfigData(config as Record<string, unknown>);
        }
      })
      .catch((error: Error) => {
        console.error("Failed to load config:", error);
      })
      .finally(() => {
        setIsConfigLoading(false);
      });
  }, [origin, urlParams]);

  // Handle theme configuration
  useEffect(() => {
    const { preset } = urlParams;

    if (
      preset &&
      !isConfigLoading &&
      configData &&
      configData &&
      "theme" in configData
    ) {
      setTheme({
        verified,
        ...(configData.theme as ControllerTheme),
      });
    } else {
      setTheme({
        verified: true,
        ...defaultTheme,
      });
    }
  }, [urlParams, verified, configData, isConfigLoading]);

  useEffect(() => {
    if (urlParams.version) {
      const validatedControllerVersion = new SemVer(
        urlParams.version ?? "0.0.0",
      );

      setControllerVersion(validatedControllerVersion);
    }
  }, [urlParams.version]);

  // Handle policies configuration
  useEffect(() => {
    const { policies, preset } = urlParams;

    const urlPolicies = parseUrlPolicies(policies);
    if (urlPolicies) {
      setPolicies(urlPolicies);
    } else if (preset && !isConfigLoading) {
      // Only try to load from config if a preset is defined and not isConfigLoading
      const configPolicies = getConfigChainPolicies(
        configData,
        chainId,
        verified,
      );

      if (configPolicies) {
        setPolicies(configPolicies);
      }
    }
  }, [urlParams, chainId, verified, configData, isConfigLoading]);

  useThemeEffect({ theme, assetUrl: "" });

  useEffect(() => {
    if (isIframe()) {
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
    } else {
      const localWalletBridge = new WalletBridge();
      const iframeMethods = localWalletBridge.getIFrameMethods();
      const currentOrigin = window.location.origin;

      setParent({
        close: () => {
          throw new Error("Can't call this function when not in an iFrame");
        },
        closeAll: () => {
          throw new Error("Can't call this function when not in an iFrame");
        },
        reload: () => {
          throw new Error("Can't call this function when not in an iFrame");
        },
        externalDetectWallets:
          iframeMethods.externalDetectWallets(currentOrigin),
        externalConnectWallet:
          iframeMethods.externalConnectWallet(currentOrigin),
        externalSignMessage: iframeMethods.externalSignMessage(currentOrigin),
        externalSignTypedData:
          iframeMethods.externalSignTypedData(currentOrigin),
        externalSendTransaction:
          iframeMethods.externalSendTransaction(currentOrigin),
        externalGetBalance: iframeMethods.externalGetBalance(currentOrigin),
      });
    }
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
    if (!parent) return;

    context?.resolve?.({
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
    isConfigLoading,
    verified,
    chainId,
    configSignupOptions,
    setController,
    setContext,
    controllerVersion,
    closeModal: parent ? closeModal : undefined,
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
