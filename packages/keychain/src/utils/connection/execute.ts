import {
  ResponseCodes,
  ConnectError,
  toArray,
  FeeSource,
} from "@cartridge/controller";
import {
  Abi,
  AllowArray,
  Call,
  CallData,
  InvocationsDetails,
  InvokeFunctionResponse,
  addAddressPadding,
} from "starknet";
import { ErrorCode } from "@cartridge/controller-wasm/controller";
import { JsCall } from "@cartridge/controller-wasm/controller";
import { mutex } from "./sync";
import Controller from "../controller";
import { storeCallbacks, generateCallbackId } from "./callbacks";

export type ControllerError = {
  code: ErrorCode;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
};

export const ESTIMATE_FEE_PERCENTAGE = 10;

export interface ExecuteParams {
  id: string;
  transactions: Call[];
  error?: ControllerError;
}

export function createExecuteUrl(
  transactions: Call[],
  options: {
    error?: ControllerError;
    resolve?: (res: InvokeFunctionResponse | ConnectError) => void;
    reject?: (reason?: unknown) => void;
    onCancel?: () => void;
  } = {},
): string {
  const id = generateCallbackId();

  // Store callbacks if provided
  if (options.resolve || options.reject || options.onCancel) {
    storeCallbacks(id, {
      resolve: options.resolve as ((result: unknown) => void) | undefined,
      reject: options.reject,
      onCancel: options.onCancel,
    });
  }

  const transactionsJson = JSON.stringify(transactions, (_, value) =>
    typeof value === "bigint" ? value.toString() : value,
  );

  let url = `/execute?id=${encodeURIComponent(id)}&transactions=${encodeURIComponent(transactionsJson)}`;

  if (options.error) {
    const errorJson = JSON.stringify(options.error);
    url += `&error=${encodeURIComponent(errorJson)}`;
  }

  return url;
}

export function parseControllerError(
  controllerError: ControllerError,
): ControllerError {
  try {
    const data = JSON.parse(controllerError.data);
    return {
      code: controllerError.code,
      message: controllerError.message,
      data,
    };
  } catch {
    return {
      code: controllerError.code,
      message: controllerError.message,
      data: { execution_error: controllerError.data },
    };
  }
}

export async function executeCore(
  origin: string,
  transactions: AllowArray<Call>,
  feeSource?: FeeSource,
): Promise<InvokeFunctionResponse> {
  const controller: Controller | undefined = window.controller;

  if (!controller) {
    throw new Error("Controller not found");
  }

  const calls = normalizeCalls(transactions);
  return await controller.trySessionExecute(origin, calls, feeSource);
}

export function execute({
  navigate,
  propagateError,
}: {
  navigate: (
    to: string | number,
    options?: { replace?: boolean; state?: unknown },
  ) => void;
  propagateError?: boolean;
  errorDisplayMode?: "modal" | "notification" | "silent"; // Available for potential future use
}) {
  // Note: errorDisplayMode is primarily handled on controller side (account.ts)
  // It's included in the type signature for API consistency and potential future use
  return (origin: string) =>
    async (
      transactions: AllowArray<Call>,
      __?: Abi[],
      ___?: InvocationsDetails,
      sync?: boolean,
      feeSource?: FeeSource,
      error?: ControllerError,
    ): Promise<InvokeFunctionResponse | ConnectError> => {
      const calls = normalizeCalls(transactions);

      if (sync) {
        return await new Promise((resolve, reject) => {
          const url = createExecuteUrl(toArray(transactions), {
            error,
            resolve,
            reject,
          });

          navigate(url, { replace: true });
        });
      }

      const release = await mutex.obtain();
      return await new Promise<InvokeFunctionResponse | ConnectError>(
        // eslint-disable-next-line no-async-promise-executor
        async (resolve, reject) => {
          const controller: Controller | undefined = window.controller;

          if (!controller) {
            return reject({
              message: "Controller context not available",
            });
          }

          // Use trySessionExecute which handles session checks internally
          try {
            const { transaction_hash } = await executeCore(
              origin,
              calls,
              feeSource,
            );
            return resolve({
              code: ResponseCodes.SUCCESS,
              transaction_hash,
            });
          } catch (e) {
            const error = e as ControllerError;
            const parsedError = parseControllerError(error);

            if (
              propagateError &&
              parsedError.code !== ErrorCode.SessionRefreshRequired &&
              parsedError.code !== ErrorCode.ManualExecutionRequired
            ) {
              return resolve({
                code: ResponseCodes.ERROR,
                message: parsedError.message,
                error: parsedError,
              });
            }

            // Check for specific error codes that require user interaction
            // SessionRefreshRequired and ManualExecutionRequired both need UI
            const url = createExecuteUrl(toArray(transactions), {
              error: parsedError,
              resolve,
              reject,
            });
            navigate(url, { replace: true });

            return resolve({
              code: ResponseCodes.USER_INTERACTION_REQUIRED,
              message: "User interaction required",
            });
          }
        },
      ).finally(() => {
        release();
      });
    };
}

export const normalizeCalls = (calls: AllowArray<Call>): JsCall[] => {
  return toArray(calls).map((call: Call) => {
    return {
      entrypoint: call.entrypoint,
      contractAddress: addAddressPadding(call.contractAddress),
      calldata: CallData.toHex(call.calldata),
    };
  });
};
