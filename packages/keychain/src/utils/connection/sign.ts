import {
  ConnectError,
  ControllerError,
  ResponseCodes,
} from "@cartridge/controller";
import { Signature, TypedData } from "starknet";
import { mutex } from "./sync";
import { parseControllerError } from "./execute";
import { generateCallbackId, storeCallbacks, getCallbacks } from "./callbacks";

export interface SignMessageParams {
  id: string;
  typedData: TypedData;
}

type SignMessageCallback = {
  resolve?: (result: Signature | ConnectError) => void;
  reject?: (reason?: unknown) => void;
  onCancel?: () => void;
};

export function createSignMessageUrl(
  typedData: TypedData,
  options: SignMessageCallback = {},
): string {
  const id = generateCallbackId();

  if (options.resolve || options.reject || options.onCancel) {
    storeCallbacks(id, {
      resolve: options.resolve,
      reject: options.reject,
      onCancel: options.onCancel,
    });
  }

  const params: SignMessageParams = {
    id,
    typedData,
  };

  return `/sign-message?data=${encodeURIComponent(JSON.stringify(params))}`;
}

export function parseSignMessageParams(
  paramString: string,
): (SignMessageCallback & { params: SignMessageParams }) | null {
  try {
    const params = JSON.parse(
      decodeURIComponent(paramString),
    ) as SignMessageParams;

    const callbacks = params.id
      ? (getCallbacks(params.id) as SignMessageCallback | undefined)
      : undefined;

    return {
      params,
      resolve: callbacks?.resolve,
      reject: callbacks?.reject,
      onCancel: callbacks?.onCancel,
    };
  } catch (error) {
    console.error("Failed to parse sign message params:", error);
    return null;
  }
}

export function signMessageFactory({
  navigate,
}: {
  navigate: (
    to: string | number,
    options?: { replace?: boolean; state?: unknown },
  ) => void;
}) {
  return async (
    typedData: TypedData,
    _account: string,
    async?: boolean,
  ): Promise<Signature | ConnectError> => {
    const controller = window.controller;

    const showSignMessage = ({
      resolve,
      reject,
    }: SignMessageCallback = {}) => {
      const url = createSignMessageUrl(typedData, {
        resolve,
        reject,
      });

      navigate(url, { replace: true });
    };

    if (!async) {
      return await new Promise((resolve, reject) => {
        showSignMessage({ resolve, reject });
      });
    }

    const release = await mutex.obtain();
    return await new Promise<Signature | ConnectError>(
      // eslint-disable-next-line no-async-promise-executor
      async (resolve, reject) => {
        if (!controller) {
          return reject("Controller not connected");
        }

        // If a session call and there is no session available
        // fallback to manual apporval flow
        if (!(await controller.hasAuthorizedPoliciesForMessage(typedData))) {
          showSignMessage({ resolve, reject });

          return resolve({
            code: ResponseCodes.USER_INTERACTION_REQUIRED,
            message: "User interaction required",
          });
        }

        try {
          const signature = await controller.signMessage(typedData);
          return resolve(signature);
        } catch (e) {
          return resolve({
            code: ResponseCodes.ERROR,
            message: (e as Error).message,
            error: parseControllerError(
              e as ControllerError & { code: number },
            ),
          });
        }
      },
    ).finally(() => {
      release();
    });
  };
}
