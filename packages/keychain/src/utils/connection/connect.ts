import { AuthOptions, ConnectError, ConnectReply } from "@cartridge/controller";
import { SessionPolicies } from "@cartridge/presets";
import { generateCallbackId, storeCallbacks, getCallbacks } from "./callbacks";

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
): string {
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

  return `/connect?id=${encodeURIComponent(id)}&signers=${encodeURIComponent(JSON.stringify(signupOptions))}`;
}

export function parseConnectParams(searchParams: URLSearchParams): {
  params: { id: string; signers: AuthOptions | undefined };
  resolve?: (result: unknown) => void;
  reject?: (reason?: unknown) => void;
  onCancel?: () => void;
} | null {
  try {
    const id = searchParams.get("id");
    const signersParam = searchParams.get("signers");

    if (!id) {
      console.error("Missing required id parameter");
      return null;
    }

    const signers = signersParam
      ? (JSON.parse(decodeURIComponent(signersParam)) as AuthOptions)
      : undefined;

    const callbacks = getCallbacks(id) as ConnectCallback | undefined;

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
      params: { id, signers },
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
}: {
  navigate: (
    to: string | number,
    options?: { replace?: boolean; state?: unknown },
  ) => void;
}) {
  return () => {
    // Support both old and new signatures for backwards compatibility
    // Old: connect(policies: SessionPolicies, rpcUrl: string, signupOptions?: AuthOptions)
    // New: connect(signupOptions?: AuthOptions)
    return (
      policiesOrSigners?: SessionPolicies | AuthOptions,
      rpcUrl?: string,
      signupOptions?: AuthOptions,
    ): Promise<ConnectReply> => {
      let signers: AuthOptions | undefined;

      // Detect which signature is being used
      if (rpcUrl !== undefined) {
        // Old signature: connect(policies, rpcUrl, signupOptions)
        // In the old signature, the first arg is policies (not used in new flow)
        // and the third arg is signupOptions
        signers = signupOptions;
      } else {
        // New signature: connect(signupOptions)
        signers = policiesOrSigners as AuthOptions | undefined;
      }

      if (signers && signers.length === 0) {
        throw new Error("If defined, signup options cannot be empty");
      }

      return new Promise<ConnectReply>((resolve, reject) => {
        const url = createConnectUrl(signers, {
          resolve: (result) => {
            if ("address" in result) {
              resolve(result);
            } else {
              reject(result);
            }
          },
          reject,
        });

        navigate(url, { replace: true });
      });
    };
  };
}
