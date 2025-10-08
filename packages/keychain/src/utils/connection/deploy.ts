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

  const params: DeployParams = {
    id,
    account,
  };

  return `/deploy?data=${encodeURIComponent(JSON.stringify(params))}`;
}

export function parseDeployParams(
  paramString: string,
): (DeployCallback & { params: DeployParams }) | null {
  try {
    const params = JSON.parse(decodeURIComponent(paramString)) as DeployParams;

    const callbacks = params.id
      ? (getCallbacks(params.id) as DeployCallback | undefined)
      : undefined;

    const resolve = callbacks?.resolve
      ? (value: { hash: string } | ConnectError) => {
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
