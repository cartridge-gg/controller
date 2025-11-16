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

function isSignMessageResult(
  value: unknown,
): value is Signature | ConnectError {
  if (!value || typeof value !== "object") {
    return false;
  }
  const obj = value as Record<string, unknown>;
  // Signature is an array [r, s] or has code/message for ConnectError
  return (
    Array.isArray(value) ||
    (typeof obj.code === "string" && typeof obj.message === "string")
  );
}

export function createSignMessageUrl(
  typedData: TypedData,
  options: SignMessageCallback = {},
): string {
  const id = generateCallbackId();

  if (options.resolve || options.reject || options.onCancel) {
    storeCallbacks(id, {
      resolve: options.resolve
        ? (result) => {
            options.resolve?.(result as Signature | ConnectError);
          }
        : undefined,
      reject: options.reject,
      onCancel: options.onCancel,
    });
  }

  const typedDataJson = JSON.stringify(typedData, (_, value) =>
    typeof value === "bigint" ? value.toString() : value,
  );

  return `/sign-message?id=${encodeURIComponent(id)}&typedData=${encodeURIComponent(typedDataJson)}`;
}

export function parseSignMessageParams(searchParams: URLSearchParams): {
  params: SignMessageParams;
  resolve?: (result: unknown) => void;
  reject?: (reason?: unknown) => void;
  onCancel?: () => void;
} | null {
  try {
    const id = searchParams.get("id");
    const typedDataParam = searchParams.get("typedData");

    if (!id || !typedDataParam) {
      console.error("Missing required parameters");
      return null;
    }

    const typedData = JSON.parse(
      decodeURIComponent(typedDataParam),
    ) as TypedData;

    const callbacks = getCallbacks(id) as SignMessageCallback | undefined;

    const reject = callbacks?.reject
      ? (reason?: unknown) => {
          callbacks.reject?.(reason);
        }
      : undefined;

    const resolve = callbacks?.resolve
      ? (value: unknown) => {
          if (!isSignMessageResult(value)) {
            const error = new Error("Invalid sign message result type");
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
      params: { id, typedData },
      resolve,
      reject,
      onCancel,
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
  return (origin: string) =>
    async (
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

          if (!origin) {
            return reject("App origin not available");
          }

          // If a session call and there is no session available
          // fallback to manual apporval flow
          if (
            !(await controller.hasAuthorizedPoliciesForMessage(
              origin,
              typedData,
            ))
          ) {
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
