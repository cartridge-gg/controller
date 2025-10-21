import { ConnectError, ResponseCodes } from "@cartridge/controller";
import { generateCallbackId, storeCallbacks, getCallbacks } from "./callbacks";
import { mutex } from "./sync";

export interface DeployParams {
  id: string;
  account: string;
}

type DeployCallback = {
  resolve?: (result: { hash: string } | ConnectError) => void;
  reject?: (reason?: unknown) => void;
  onCancel?: () => void;
};

function isDeployResult(
  value: unknown,
): value is { hash: string } | ConnectError {
  if (!value || typeof value !== "object") {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    ("hash" in obj && typeof obj.hash === "string") ||
    (typeof obj.code === "string" && typeof obj.message === "string")
  );
}

export function createDeployUrl(
  account: string,
  options: DeployCallback = {},
): string {
  const id = generateCallbackId();

  if (options.resolve || options.reject || options.onCancel) {
    storeCallbacks(id, {
      resolve: options.resolve
        ? (result) => {
            options.resolve?.(result as { hash: string } | ConnectError);
          }
        : undefined,
      reject: options.reject,
      onCancel: options.onCancel,
    });
  }

  return `/deploy?id=${encodeURIComponent(id)}&account=${encodeURIComponent(account)}`;
}

export function parseDeployParams(searchParams: URLSearchParams): {
  params: DeployParams;
  resolve?: (result: unknown) => void;
  reject?: (reason?: unknown) => void;
  onCancel?: () => void;
} | null {
  try {
    const id = searchParams.get("id");
    const account = searchParams.get("account");

    if (!id || !account) {
      console.error("Missing required parameters");
      return null;
    }

    const callbacks = getCallbacks(id) as DeployCallback | undefined;

    const reject = callbacks?.reject
      ? (reason?: unknown) => {
          callbacks.reject?.(reason);
        }
      : undefined;

    const resolve = callbacks?.resolve
      ? (value: unknown) => {
          if (!isDeployResult(value)) {
            const error = new Error("Invalid deploy result type");
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
      params: { id, account },
      resolve,
      reject,
      onCancel,
    };
  } catch (error) {
    console.error("Failed to parse deploy params:", error);
    return null;
  }
}

export function deployFactory({
  navigate,
}: {
  navigate: (
    to: string | number,
    options?: { replace?: boolean; state?: unknown },
  ) => void;
}) {
  return async (account: string): Promise<{ hash: string } | ConnectError> => {
    const controller = window.controller;

    const showDeploy = ({ resolve, reject }: DeployCallback = {}) => {
      const url = createDeployUrl(account, {
        resolve,
        reject,
      });

      navigate(url, { replace: true });
    };

    const release = await mutex.obtain();
    return await new Promise<{ hash: string } | ConnectError>(
      // eslint-disable-next-line no-async-promise-executor
      async (resolve, reject) => {
        if (!controller) {
          return reject("Controller not connected");
        }

        // Check if account is already deployed
        try {
          const isDeployed = await controller.account.isDeployed();
          if (isDeployed) {
            return resolve({
              code: ResponseCodes.SUCCESS,
              message: "Account already deployed",
            });
          }
        } catch {
          // If we can't check deployment status, show the deploy UI
        }

        showDeploy({ resolve, reject });

        return resolve({
          code: ResponseCodes.USER_INTERACTION_REQUIRED,
          message: "User interaction required",
        });
      },
    ).finally(() => {
      release();
    });
  };
}
