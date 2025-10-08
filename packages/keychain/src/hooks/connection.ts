import { fetchController } from "@/components/connect/create/utils";
import {
  ConnectionContext,
  ConnectionContextValue,
  VerifiableControllerTheme,
} from "@/components/provider/connection";
import { useNavigation } from "@/context/navigation";
import { ConnectionCtx, connectToController } from "@/utils/connection";
import { TurnkeyWallet } from "@/wallets/social/turnkey";
import { WalletConnectWallet } from "@/wallets/wallet-connect";
import {
  AuthOptions,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
  IMPLEMENTED_AUTH_OPTIONS,
  ResponseCodes,
  toArray,
  Token,
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
import {
  ETH_CONTRACT_ADDRESS,
  isIframe,
  normalizeOrigin,
  STRK_CONTRACT_ADDRESS,
  USDC_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
} from "@cartridge/ui/utils";
import { Eip191Credentials } from "@cartridge/ui/utils/api/cartridge";
import { getAddress } from "ethers";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SemVer } from "semver";
import {
  constants,
  getChecksumAddress,
  RpcProvider,
  shortString,
} from "starknet";
import { ParsedSessionPolicies, parseSessionPolicies } from "./session";

const LORDS_CONTRACT_ADDRESS = getChecksumAddress(
  "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
);

const TOKEN_ADDRESSES: Record<Token, string> = {
  eth: ETH_CONTRACT_ADDRESS,
  strk: STRK_CONTRACT_ADDRESS,
  lords: LORDS_CONTRACT_ADDRESS,
  usdc: USDC_CONTRACT_ADDRESS,
  usdt: USDT_CONTRACT_ADDRESS,
};

export type ParentMethods = AsyncMethodReturns<{
  close: () => Promise<void>;
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
  externalSwitchChain: (
    identifier: string,
    chainId: string,
  ) => Promise<boolean>;
  externalWaitForTransaction: (
    identifier: string,
    txHash: string,
    timeoutMs?: number,
  ) => Promise<ExternalWalletResponse>;
}>;

/**
 * Parses policies from a URL string.
 * @param policiesStr - The encoded policies string from the URL.
 * @returns ParsedSessionPolicies or undefined if parsing fails.
 */
export function parseUrlPolicies(
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
  const { navigate } = useNavigation();
  const [parent, setParent] = useState<ParentMethods>();
  const [context, setContext] = useState<ConnectionCtx>();
  const [origin, setOrigin] = useState<string | undefined>(undefined);
  const [rpcUrl, setRpcUrl] = useState<string>(
    import.meta.env.VITE_RPC_MAINNET,
  );
  const [policies, setPolicies] = useState<ParsedSessionPolicies>();
  const [verified, setVerified] = useState<boolean>(false);
  const [isConfigLoading, setIsConfigLoading] = useState<boolean>(false);
  const [isMainnet, setIsMainnet] = useState<boolean>(false);
  const [configData, setConfigData] = useState<Record<string, unknown> | null>(
    null,
  );
  const [theme, setTheme] = useState<VerifiableControllerTheme>({
    verified: true,
    ...defaultTheme,
  });
  const [configSignupOptions, setConfigSignupOptions] = useState<
    AuthOptions | undefined
  >([...IMPLEMENTED_AUTH_OPTIONS]);
  const [controller, setController] = useState(window.controller);
  const [chainId, setChainId] = useState<string>();
  const [controllerVersion, setControllerVersion] = useState<SemVer>();
  const [onModalClose, setOnModalCloseInternal] = useState<
    (() => void) | undefined
  >();

  const setOnModalClose = useCallback((fn: (() => void) | undefined) => {
    setOnModalCloseInternal(() => fn);
  }, []);

  useEffect(() => {
    if (controller) {
      setRpcUrl(controller.rpcUrl());
    }
  }, [controller, setRpcUrl]);

  const [searchParams] = useSearchParams();

  const urlParams = useMemo(() => {
    const urlParams = new URLSearchParams(searchParams);
    const theme = urlParams.get("theme");
    const preset = window.location.pathname.startsWith("/slot")
      ? "slot"
      : urlParams.get("preset");
    const rpcUrl = urlParams.get("rpc_url");
    const policies = urlParams.get("policies");
    const version = urlParams.get("v");
    const project = urlParams.get("ps");
    const namespace = urlParams.get("ns");

    const erc20Param = urlParams.get("erc20");
    const tokens = erc20Param
      ? decodeURIComponent(erc20Param)
          .split(",")
          .map((token) => TOKEN_ADDRESSES[token as Token] || null)
          .filter((address) => address !== null)
      : [
          STRK_CONTRACT_ADDRESS,
          ETH_CONTRACT_ADDRESS,
          USDC_CONTRACT_ADDRESS,
          USDT_CONTRACT_ADDRESS,
          LORDS_CONTRACT_ADDRESS,
        ];

    if (rpcUrl) {
      setRpcUrl(rpcUrl);
    }

    return {
      theme,
      preset,
      policies,
      version,
      project,
      namespace,
      tokens,
    };
  }, [searchParams]);

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
        const controllerQuery = await fetchController(
          chainId,
          controller.username(),
          new AbortController().signal,
        );
        if (
          !controllerQuery.controller ||
          !controllerQuery.controller.signers
        ) {
          return;
        }

        const signers = controllerQuery.controller.signers.filter(
          (signer) =>
            signer.metadata.__typename === "Eip191Credentials" &&
            (signer.metadata.eip191?.[0]?.provider === "discord" ||
              signer.metadata.eip191?.[0]?.provider === "walletconnect" ||
              signer.metadata.eip191?.[0]?.provider === "google"),
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
          } else if (provider === "discord" || provider === "google") {
            const turnkeyWallet = new TurnkeyWallet(
              controller.username(),
              chainId,
              controller.rpcUrl(),
              provider,
            );
            if (!turnkeyWallet) {
              throw new Error("Embedded Turnkey wallet not found");
            }

            turnkeyWallet.account = getAddress(ethAddress);
            turnkeyWallet.subOrganizationId = undefined;

            window.keychain_wallets!.addEmbeddedWallet(
              ethAddress,
              turnkeyWallet as unknown as WalletAdapter,
            );
          }
        }
      } catch (error) {
        console.error("Failed to add embedded wallet:", error);
      }
    })();
  }, [controller?.username, chainId, controller]);

  // Handle controller initialization
  useEffect(() => {
    setIsMainnet(
      import.meta.env.PROD &&
        controller?.chainId() === constants.StarknetChainId.SN_MAIN,
    );
  }, [controller]);

  // Check if preset is verified for the current origin, supporting wildcards
  // Only run verification once we have the parent origin from penpal
  useEffect(() => {
    if (!urlParams.preset || !origin) {
      return;
    }

    setIsConfigLoading(true);
    loadConfig(urlParams.preset)
      .then((config) => {
        if (config && config.origin) {
          const allowedOrigins = toArray(config.origin as string | string[]);
          // Always consider localhost as verified for development (not 127.0.0.1)
          const isLocalhost = origin.includes("localhost");
          const isOriginAllowed = isOriginVerified(origin, allowedOrigins);
          const finalVerified = isLocalhost || isOriginAllowed;
          setVerified(finalVerified);
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

    // Skip if the theme has already been set and preset is not defined
    if (theme.name !== defaultTheme.name && !preset) return;

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
  }, [urlParams, verified, configData, isConfigLoading, theme.name]);

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

    // Always prioritize preset policies over URL policies
    if (preset && !isConfigLoading) {
      const configPolicies = getConfigChainPolicies(
        configData,
        chainId,
        verified,
      );

      if (configPolicies) {
        setPolicies(configPolicies);
        return;
      }
    }

    // Fall back to URL policies if no preset or preset has no policies
    const urlPolicies = parseUrlPolicies(policies);
    if (urlPolicies) {
      setPolicies(urlPolicies);
    }
  }, [urlParams, chainId, verified, configData, isConfigLoading]);

  useThemeEffect({ theme, assetUrl: "" });

  useEffect(() => {
    if (isIframe()) {
      const connection = connectToController<ParentMethods>({
        setRpcUrl,
        setContext,
        setController,
        navigate,
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
        externalSwitchChain: iframeMethods.externalSwitchChain(currentOrigin),
        externalWaitForTransaction:
          iframeMethods.externalWaitForTransaction(currentOrigin),
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(async () => {
    await window.controller?.disconnect();
    window.location.reload();
    if (parent) {
      parent.close();
      parent.reload();
    }

    if (context) {
      context.resolve?.({
        code: ResponseCodes.NOT_CONNECTED,
        message: "User logged out",
      });
    }
  }, [context, parent]);

  const openSettings = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent("controller-navigate", {
        detail: {
          path: "/settings",
          options: {
            resetStack: false,
          },
        },
      }),
    );
  }, []);

  const closeModal = useCallback(async () => {
    if (!parent) {
      return;
    }

    context?.resolve?.({
      code: ResponseCodes.CANCELED,
      message: "User aborted",
    });

    setContext(undefined);

    // Don't await parent.close() - let it run in the background
    parent.close().catch((e) => {
      console.error("Failed to close modal:", e);
    });
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

  const externalWaitForTransaction = useCallback(
    (identifier: string, txHash: string, timeoutMs?: number) => {
      if (!parent) {
        return Promise.reject(new Error("Parent connection not ready."));
      }
      return parent.externalWaitForTransaction(identifier, txHash, timeoutMs);
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
    onModalClose,
    setOnModalClose,
    theme,
    project: urlParams.project,
    namespace: urlParams.namespace,
    tokens: urlParams.tokens,
    isConfigLoading,
    isMainnet,
    verified,
    chainId,
    configSignupOptions,
    setController,
    setContext,
    setRpcUrl,
    setConfigSignupOptions,
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
    externalWaitForTransaction,
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
