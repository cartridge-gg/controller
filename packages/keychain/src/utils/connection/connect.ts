import {
  AuthOptions,
  ConnectError,
  ConnectReply,
  ConnectOptions,
} from "@cartridge/controller";
import { SessionPolicies } from "@cartridge/presets";
import { generateCallbackId, storeCallbacks, getCallbacks } from "./callbacks";

type HeadlessConnectOptions = Required<
  Pick<ConnectOptions, "username" | "signer">
> &
  Pick<ConnectOptions, "password">;

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
  headless?: HeadlessConnectOptions,
): string {
  const id = generateCallbackId();

  if (options.resolve || options.reject || options.onCancel || headless) {
    storeCallbacks(id, {
      resolve: options.resolve
        ? (result) => {
            options.resolve?.(result as ConnectReply | ConnectError);
          }
        : undefined,
      reject: options.reject,
      onCancel: options.onCancel,
      headless,
    });
  }

  const params = new URLSearchParams({ id });
  if (signupOptions !== undefined) {
    params.set("signers", JSON.stringify(signupOptions));
  }

  return `/connect?${params.toString()}`;
}

export function parseConnectParams(searchParams: URLSearchParams): {
  params: { id?: string; signers: AuthOptions | undefined };
  resolve?: (result: unknown) => void;
  reject?: (reason?: unknown) => void;
  onCancel?: () => void;
  headless?: HeadlessConnectOptions;
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
          signers = JSON.parse(decoded) as AuthOptions;
        }
      } catch (e) {
        console.error("Failed to parse signers parameter:", e);
        // Continue with undefined signers on parse error
      }
    }

    let callbacks:
      | (ConnectCallback & { headless?: HeadlessConnectOptions })
      | undefined;
    if (id) {
      callbacks = getCallbacks(id) as
        | (ConnectCallback & { headless?: HeadlessConnectOptions })
        | undefined;
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
      headless: callbacks?.headless,
    };
  } catch (error) {
    console.error("Failed to parse connect params:", error);
    return null;
  }
}

export function connect({
  navigate,
  setRpcUrl,
}: {
  navigate: (
    to: string | number,
    options?: { replace?: boolean; state?: unknown },
  ) => void;
  setRpcUrl: (url: string) => void;
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
      let signers: AuthOptions | undefined;
      let headless: HeadlessConnectOptions | undefined;

      // Detect which signature is being used
      // Check if it's the old 3-parameter signature (policies, rpcUrl, signupOptions)
      if (
        rpcUrl !== undefined &&
        typeof rpcUrl === "string" &&
        (rpcUrl.startsWith("http://") || rpcUrl.startsWith("https://"))
      ) {
        // Old signature: connect(policies, rpcUrl, signupOptions)
        signers = signupOptions;
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
        const options = policiesOrOptions as ConnectOptions;
        signers = options.signupOptions;
        if (options.username && options.signer) {
          headless = {
            username: options.username,
            signer: options.signer,
            password: options.password,
          };
        }
      } else {
        // Assume it's just AuthOptions passed directly (backwards compatibility)
        signers = policiesOrOptions as AuthOptions | undefined;
      }

      if (signers && signers.length === 0) {
        throw new Error("If defined, signup options cannot be empty");
      }

      return new Promise<ConnectReply>((resolve, reject) => {
        const url = createConnectUrl(
          signers,
          {
            resolve: (result) => {
              if ("address" in result) {
                resolve(result);
              } else {
                reject(result);
              }
            },
            reject,
          },
          headless,
        );

        navigate(url, { replace: true });
      });
    };
  };
}
