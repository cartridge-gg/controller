import type {
  ConnectError,
  ConnectReply,
  SessionPolicies,
} from "@cartridge/controller";
import { generateCallbackId, storeCallbacks, getCallbacks } from "./callbacks";

type UpdateSessionCallback = {
  resolve?: (result: ConnectReply | ConnectError) => void;
  reject?: (reason?: unknown) => void;
  onCancel?: () => void;
};

function isUpdateSessionResult(
  value: unknown,
): value is ConnectReply | ConnectError {
  if (!value || typeof value !== "object") {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return typeof obj.code === "string" && ("address" in obj || "message" in obj);
}

export function createUpdateSessionUrl(
  policies?: SessionPolicies,
  preset?: string,
  options: UpdateSessionCallback = {},
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

  const params = new URLSearchParams({ id });

  if (policies) {
    params.set("policies", encodeURIComponent(JSON.stringify(policies)));
  }

  if (preset) {
    params.set("preset", encodeURIComponent(preset));
  }

  return `/update-session?${params.toString()}`;
}

export function parseUpdateSessionParams(searchParams: URLSearchParams): {
  params: {
    id?: string;
    policies?: SessionPolicies;
    preset?: string;
  };
  resolve?: (result: unknown) => void;
  reject?: (reason?: unknown) => void;
  onCancel?: () => void;
} | null {
  try {
    const id = searchParams.get("id");
    const policiesParam = searchParams.get("policies");
    const presetParam = searchParams.get("preset");

    let policies: SessionPolicies | undefined;
    if (policiesParam) {
      try {
        policies = JSON.parse(
          decodeURIComponent(policiesParam),
        ) as SessionPolicies;
      } catch (e) {
        console.error("Failed to parse update session policies:", e);
      }
    }

    const preset = presetParam ? decodeURIComponent(presetParam) : undefined;

    let callbacks: UpdateSessionCallback | undefined;
    if (id) {
      callbacks = getCallbacks(id) as UpdateSessionCallback | undefined;
    }

    const reject = callbacks?.reject
      ? (reason?: unknown) => {
          callbacks.reject?.(reason);
        }
      : undefined;

    const resolve = callbacks?.resolve
      ? (value: unknown) => {
          if (!isUpdateSessionResult(value)) {
            const error = new Error("Invalid update session result type");
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
      params: { id: id || undefined, policies, preset },
      resolve,
      reject,
      onCancel,
    };
  } catch (error) {
    console.error("Failed to parse update session params:", error);
    return null;
  }
}

export function updateSession({
  navigate,
}: {
  navigate: (
    to: string | number,
    options?: { replace?: boolean; state?: unknown },
  ) => void;
}) {
  return () =>
    (policies?: SessionPolicies, preset?: string): Promise<ConnectReply> => {
      if (!policies && !preset) {
        return Promise.reject(
          new Error("Either `policies` or `preset` must be provided"),
        );
      }

      return new Promise<ConnectReply>((resolve, reject) => {
        const url = createUpdateSessionUrl(policies, preset, {
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
}
