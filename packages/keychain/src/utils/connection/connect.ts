import {
  AuthOptions,
  ConnectError,
  ConnectOptions,
  ConnectReply,
  LocationGateOptions,
  ResponseCodes,
} from "@cartridge/controller";
import { SessionPolicies } from "@cartridge/presets";
import { generateCallbackId, storeCallbacks, getCallbacks } from "./callbacks";
import type { SemVer } from "semver";
import gte from "semver/functions/gte";

export const CONNECT_KEEP_OPEN_MIN_VERSION = "0.13.13";

/**
 * `keepOpen` was added after the published 0.13.12 SDK. Standalone keychain
 * flows have no parent SDK and always use the current behavior.
 */
export function supportsConnectKeepOpen(
  controllerVersion: SemVer | undefined,
  isStandalone: boolean,
): boolean {
  return (
    isStandalone ||
    (!!controllerVersion &&
      gte(controllerVersion, CONNECT_KEEP_OPEN_MIN_VERSION))
  );
}

/** Only add the response field for SDKs that know how to keep the iframe open. */
export function createConnectReply(
  address: string,
  keepOpen: boolean,
  includeKeepOpen: boolean,
): ConnectReply {
  return {
    code: ResponseCodes.SUCCESS,
    address,
    ...(includeKeepOpen ? { keepOpen } : {}),
  };
}

export function shouldContinueConnectOnboarding(
  isNewController: boolean,
  canKeepOpen: boolean,
  pathname: string,
): boolean {
  return isNewController && canKeepOpen && pathname !== "/session";
}

export interface ConnectParams {
  id: string;
  origin: string;
  policies: SessionPolicies | undefined;
  rpcUrl: string;
  signupOptions?: AuthOptions;
}

type ConnectCallback = {
  resolve?: (result: ConnectReply | ConnectError) => void;
  reject?: (reason?: unknown) => void;
  onCancel?: () => void;
};

function isConnectResult(value: unknown): value is ConnectReply | ConnectError {
  if (!value || typeof value !== "object") {
    return false;
  }
  const obj = value as Record<string, unknown>;
  // ConnectReply has code and address
  // ConnectError has code and message
  return typeof obj.code === "string" && ("address" in obj || "message" in obj);
}

export function createConnectUrl(
  signupOptions?: AuthOptions,
  options: ConnectCallback = {},
): { url: string; id: string } {
  const id = generateCallbackId();

  if (options.resolve || options.reject || options.onCancel) {
    storeCallbacks(id, {
      resolve: options.resolve
        ? (result) => {
            options.resolve?.(result as ConnectReply | ConnectError);
          }
        : undefined,
      reject: options.reject,
      onCancel: options.onCancel,
    });
  }

  const params = new URLSearchParams({ id });
  if (signupOptions !== undefined) {
    params.set("signers", JSON.stringify(signupOptions));
  }

  return { url: `/connect?${params.toString()}`, id };
}

export function parseConnectParams(searchParams: URLSearchParams): {
  params: { id?: string; signers: AuthOptions | undefined };
  resolve?: (result: unknown) => void;
  reject?: (reason?: unknown) => void;
  onCancel?: () => void;
} | null {
  try {
    const id = searchParams.get("id");
    const signersParam = searchParams.get("signers");

    let signers: AuthOptions | undefined;
    if (signersParam) {
      try {
        const decoded = decodeURIComponent(signersParam);
        // Handle case where signupOptions was undefined and got stringified as "undefined"
        if (decoded !== "undefined" && decoded !== "null") {
          const parsed = JSON.parse(decoded) as AuthOptions | ConnectOptions;
          if (Array.isArray(parsed)) {
            signers = parsed as AuthOptions;
          } else if (parsed && typeof parsed === "object") {
            const maybeOptions = parsed as ConnectOptions;
            if (
              "signupOptions" in maybeOptions &&
              Array.isArray(maybeOptions.signupOptions)
            ) {
              signers = maybeOptions.signupOptions;
            }
          }
        }
      } catch (e) {
        console.error("Failed to parse signers parameter:", e);
        // Continue with undefined signers on parse error
      }
    }

    let callbacks: ConnectCallback | undefined;
    if (id) {
      callbacks = getCallbacks(id) as ConnectCallback | undefined;
    }

    const reject = callbacks?.reject
      ? (reason?: unknown) => {
          callbacks.reject?.(reason);
        }
      : undefined;

    const resolve = callbacks?.resolve
      ? (value: unknown) => {
          if (!isConnectResult(value)) {
            const error = new Error("Invalid connect result type");
            console.error(error.message, value);
            reject?.(error);
            return;
          }
          callbacks.resolve?.(value);
        }
      : undefined;

    const onCancel = callbacks?.onCancel
      ? () => {
          callbacks.onCancel?.();
        }
      : undefined;

    return {
      params: { id: id || undefined, signers },
      resolve,
      reject,
      onCancel,
    };
  } catch (error) {
    console.error("Failed to parse connect params:", error);
    return null;
  }
}

export function connect({
  navigate,
  setRpcUrl,
  resetLocationGateVerified,
}: {
  navigate: (
    to: string | number,
    options?: { replace?: boolean; state?: unknown },
  ) => void;
  setRpcUrl: (url: string) => void;
  getLocationGate?: () => LocationGateOptions | undefined;
  resetLocationGateVerified?: () => void;
}) {
  return () => {
    // Support both old and new signatures for backwards compatibility
    // Old: connect(policies: SessionPolicies, rpcUrl: string, signupOptions?: AuthOptions)
    // New: connect(options?: ConnectOptions)
    return (
      policiesOrOptions?: SessionPolicies | AuthOptions | ConnectOptions,
      rpcUrl?: string,
      signupOptions?: AuthOptions,
    ): Promise<ConnectReply> => {
      let options: ConnectOptions = {};
      const isValidUrl = (value: string) => {
        try {
          const url = new URL(value);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      };

      // Detect which signature is being used
      // Check if it's the old 3-parameter signature (policies, rpcUrl, signupOptions)
      if (
        rpcUrl !== undefined &&
        typeof rpcUrl === "string" &&
        isValidUrl(rpcUrl)
      ) {
        // Old signature: connect(policies, rpcUrl, signupOptions)
        options.signupOptions = signupOptions;
        setRpcUrl(rpcUrl);
      } else if (
        policiesOrOptions &&
        typeof policiesOrOptions === "object" &&
        !Array.isArray(policiesOrOptions) &&
        ("signupOptions" in policiesOrOptions ||
          "username" in policiesOrOptions ||
          "signer" in policiesOrOptions ||
          "password" in policiesOrOptions)
      ) {
        // New signature: connect(options: ConnectOptions)
        options = policiesOrOptions as ConnectOptions;
      } else {
        // Assume it's just AuthOptions passed directly (backwards compatibility)
        if (Array.isArray(policiesOrOptions)) {
          options.signupOptions = policiesOrOptions as AuthOptions;
        }
      }

      if (options.signupOptions && options.signupOptions.length === 0) {
        throw new Error("If defined, signup options cannot be empty");
      }

      // Reset location gate verification for each new connect call
      resetLocationGateVerified?.();

      return new Promise<ConnectReply>((resolve, reject) => {
        const { url } = createConnectUrl(options.signupOptions, {
          resolve: (result) => {
            if ("address" in result) {
              resolve(result);
            } else {
              reject(result);
            }
          },
          reject,
        });

        // Authentication must complete before ConnectRoute redirects an
        // authenticated controller to the configured location gate.
        navigate(url, { replace: true });
      });
    };
  };
}
