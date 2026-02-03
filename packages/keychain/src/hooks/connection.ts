import { fetchController } from "@/components/connect/create/utils";
import {
  ConnectionContext,
  ConnectionContextValue,
  VerifiableControllerTheme,
} from "@/components/provider/connection";
import { useNavigation } from "@/context/navigation";
import { connectToController } from "@/utils/connection";
import { TurnkeyWallet } from "@/wallets/social/turnkey";
import { WalletConnectWallet } from "@/wallets/wallet-connect";
import {
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
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
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import { SemVer } from "semver";
import {
  constants,
  getChecksumAddress,
  RpcProvider,
  shortString,
} from "starknet";
import { ParsedSessionPolicies, parseSessionPolicies } from "./session";
import {
  storeReferral,
  lookupReferrerAddress,
  isValidFelt,
} from "@/utils/referral";

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

  // Session creation callback (for standalone auth flow)
  onSessionCreated?: () => Promise<void>;

  // Starterpack play callback (for purchase completion flow)
  onStarterpackPlay?: () => Promise<void>;
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
  const urlParamsRef = useRef<{
    theme: string | null;
    preset: string | null;
    policies: string | null;
    version: string | null;
    project: string | null;
    namespace: string | null;
    tokens: string[];
    ref: string | null;
    refGroup: string | null;
    propagateError: boolean;
    errorDisplayMode?: "modal" | "notification" | "silent";
  }>();

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
    const ref = urlParams.get("ref");
    const refGroup = urlParams.get("ref_group");
    const propagateError = urlParams.get("propagate_error") === "true";
    const errorDisplayMode = urlParams.get("error_display_mode") as
      | "modal"
      | "notification"
      | "silent"
      | null;

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
      setRpcUrl(decodeURIComponent(rpcUrl));
    }

    // Build params object, preserving previous values for any param that is null/empty
    const newParams = {
      theme: theme || urlParamsRef.current?.theme || null,
      preset: preset || urlParamsRef.current?.preset || null,
      policies: policies || urlParamsRef.current?.policies || null,
      version: version || urlParamsRef.current?.version || null,
      project: project || urlParamsRef.current?.project || null,
      namespace: namespace || urlParamsRef.current?.namespace || null,
      tokens: erc20Param ? tokens : urlParamsRef.current?.tokens || tokens,
      ref: ref || urlParamsRef.current?.ref || null,
      refGroup: refGroup || urlParamsRef.current?.refGroup || null,
      propagateError:
        propagateError || urlParamsRef.current?.propagateError || false,
      errorDisplayMode:
        errorDisplayMode || urlParamsRef.current?.errorDisplayMode || undefined,
    };

    // Store the new params for future reference
    urlParamsRef.current = newParams;
    return newParams;
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

  useEffect(() => {
    setIsMainnet(controller?.chainId() === constants.StarknetChainId.SN_MAIN);
  }, [controller]);

  // Load config when preset is provided
  useEffect(() => {
    if (!urlParams.preset) {
      return;
    }

    setIsConfigLoading(true);
    loadConfig(urlParams.preset)
      .then((config) => {
        setConfigData((config as Record<string, unknown>) || null);
      })
      .catch((error: Error) => {
        console.error("Failed to load config:", error);
        setConfigData(null);
      })
      .finally(() => {
        setIsConfigLoading(false);
      });
  }, [urlParams.preset]);

  // Compute verified state separately once config is loaded and origin or redirect_url are available
  useEffect(() => {
    if (!configData || isConfigLoading) {
      return;
    }

    const allowedOrigins = toArray(configData.origin as string | string[]);

    // In standalone mode (not iframe), verify preset if redirect_url matches preset whitelist
    if (!isIframe()) {
      const searchParams = new URLSearchParams(window.location.search);
      const redirectUrl = searchParams.get("redirect_url");

      if (redirectUrl) {
        try {
          const redirectUrlObj = new URL(redirectUrl);
          const redirectOrigin = redirectUrlObj.origin;

          // Always consider localhost and capacitor as verified for development
          const isLocalhost =
            redirectOrigin.includes("localhost") ||
            redirectOrigin.startsWith("capacitor://");
          const isOriginAllowed = isOriginVerified(
            redirectOrigin,
            allowedOrigins,
          );
          const finalVerified = isLocalhost || isOriginAllowed;

          setVerified(finalVerified);
          return;
        } catch (error) {
          console.error("Failed to parse redirect_url:", error);
        }
      }

      // No redirect_url or invalid redirect_url - don't verify preset in standalone mode
      setVerified(false);
      return;
    }

    if (!configData.origin) {
      setVerified(false);
      return;
    }

    // Embedded mode: verify against parent origin
    // Always consider localhost and capacitor as verified for development (not 127.0.0.1)
    if (origin) {
      const isLocalhost =
        origin.includes("localhost") || origin.startsWith("capacitor://");
      const isOriginAllowed = isOriginVerified(origin, allowedOrigins);
      const finalVerified = isLocalhost || isOriginAllowed;
      setVerified(finalVerified);
    } else {
      setVerified(false);
    }
  }, [origin, configData, isConfigLoading]);

  // Store referral data when URL params are available
  useEffect(() => {
    const { ref, refGroup } = urlParams;

    let refGroupLocal: string | null = refGroup;

    // Only store if ref parameter is present and origin is available
    if (!ref || !origin) {
      return;
    }

    // Validation: check if refGroup fits in felt252
    if (refGroup && !isValidFelt(refGroup)) {
      console.error(
        "[Referral] refGroup exceeds 31 characters or contains invalid characters:",
        refGroup,
      );
      refGroupLocal = null;
    }

    // Strip https:// from origin to get game URL
    const gameUrl = origin.replace(/^https?:\/\//, "");
    if (!gameUrl) {
      return;
    }

    // If ref is a username, lookup the address. If it's already an address, use it directly
    const fetchAndStoreReferral = async () => {
      try {
        let refAddress: string = "";
        // ref is a username, look up the address
        const address = await lookupReferrerAddress(ref);
        if (address) {
          refAddress = address;
        }

        // Store the referral with the resolved address
        storeReferral(ref, gameUrl, refGroupLocal || undefined, refAddress);
      } catch (error) {
        console.error("[Referral] Failed to fetch and store referral:", error);
        // Store without address on error
        storeReferral(ref, gameUrl, refGroupLocal || undefined);
      }
    };

    fetchAndStoreReferral();
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
        setController,
        navigate,
        propagateError: urlParams.propagateError,
        errorDisplayMode: urlParams.errorDisplayMode,
      });

      connection.promise
        .then((parentConnection) => {
          setOrigin(normalizeOrigin(parentConnection.origin));
          // Extract origin and spread the rest to match ParentMethods type
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { origin: _, ...methods } = parentConnection;
          setParent(methods as ParentMethods);
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

      // In standalone mode with redirect, use redirect URI's origin for app ID
      const searchParams = new URLSearchParams(window.location.search);
      const redirectUrl = searchParams.get("redirect_url");
      let appOrigin = window.location.origin;

      if (redirectUrl) {
        try {
          const redirectUrlObj = new URL(redirectUrl);
          appOrigin = redirectUrlObj.origin;
        } catch (error) {
          console.error("Failed to parse redirect_url for app ID:", error);
          // Fall back to window.location.origin if redirect URL is invalid
        }
      }

      setOrigin(appOrigin);

      setParent({
        close: async () => {},
        reload: async () => {},
        externalDetectWallets: iframeMethods.externalDetectWallets(appOrigin),
        externalConnectWallet: iframeMethods.externalConnectWallet(appOrigin),
        externalSignMessage: iframeMethods.externalSignMessage(appOrigin),
        externalSignTypedData: iframeMethods.externalSignTypedData(appOrigin),
        externalSendTransaction:
          iframeMethods.externalSendTransaction(appOrigin),
        externalGetBalance: iframeMethods.externalGetBalance(appOrigin),
        externalSwitchChain: iframeMethods.externalSwitchChain(appOrigin),
        externalWaitForTransaction:
          iframeMethods.externalWaitForTransaction(appOrigin),
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
  }, [parent]);

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

    // Don't await parent.close() - let it run in the background
    parent.close().catch((e) => {
      console.error("Failed to close modal:", e);
    });
  }, [parent]);

  const openModal = useCallback(async () => {
    if (!parent) return;

    try {
      await parent.close();
    } catch (e) {
      console.error("Failed to open modal:", e);
    }
  }, [parent]);

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
    controller,
    origin: origin || "",
    rpcUrl,
    policies,
    onModalClose,
    setOnModalClose,
    theme,
    project: urlParams.project,
    namespace: urlParams.namespace,
    tokens: urlParams.tokens,
    propagateError: urlParams.propagateError,
    isConfigLoading,
    isMainnet,
    verified,
    chainId,
    setController,
    setRpcUrl,
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
