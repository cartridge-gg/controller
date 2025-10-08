import { AuthOptions, ConnectError, ConnectReply } from "@cartridge/controller";
import { Policies } from "@cartridge/presets";
import { generateCallbackId, storeCallbacks, getCallbacks } from "./callbacks";

export interface ConnectParams {
  id: string;
  origin: string;
  policies: Policies;
  rpcUrl: string;
  signupOptions?: AuthOptions;
}

type ConnectCallback = {
  resolve?: (result: ConnectReply | ConnectError) => void;
  reject?: (reason?: unknown) => void;
  onCancel?: () => void;
};

export function createConnectUrl(
  origin: string,
  policies: Policies,
  rpcUrl: string,
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

  const params: ConnectParams = {
    id,
    origin,
    policies,
    rpcUrl,
    signupOptions,
  };

  return `/connect?data=${encodeURIComponent(JSON.stringify(params))}`;
}

export function parseConnectParams(
  paramString: string,
): (ConnectCallback & { params: ConnectParams }) | null {
  try {
    const params = JSON.parse(decodeURIComponent(paramString)) as ConnectParams;

    const callbacks = params.id
      ? (getCallbacks(params.id) as ConnectCallback | undefined)
      : undefined;

    const resolve = callbacks?.resolve
      ? (value: ConnectReply | ConnectError) => {
          callbacks.resolve?.(value);
        }
      : undefined;

    const reject = callbacks?.reject
      ? (reason?: unknown) => {
          callbacks.reject?.(reason);
        }
      : undefined;

    const onCancel = callbacks?.onCancel
      ? () => {
          callbacks.onCancel?.();
        }
      : undefined;

    return {
      params,
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
  return (origin: string) => {
    return (
      policies: Policies,
      rpcUrl: string,
      signupOptions?: AuthOptions,
    ): Promise<ConnectReply> => {
      if (signupOptions && signupOptions.length === 0) {
        throw new Error("If defined, signup options cannot be empty");
      }

      return new Promise<ConnectReply>((resolve, reject) => {
        const url = createConnectUrl(origin, policies, rpcUrl, signupOptions, {
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
