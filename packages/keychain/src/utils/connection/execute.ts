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
import { ControllerError } from "./types";
import { ErrorCode, JsCall } from "@cartridge/controller-wasm/controller";
import { mutex } from "./sync";
import Controller from "../controller";
import { storeCallbacks, generateCallbackId } from "./callbacks";

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
      resolve: options.resolve,
      reject: options.reject,
      onCancel: options.onCancel,
    });
  }

  const executeParams: ExecuteParams = {
    id,
    transactions,
    error: options.error,
  };

  const paramString = encodeURIComponent(JSON.stringify(executeParams));
  return `/execute?data=${paramString}`;
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
  transactions: AllowArray<Call>,
  feeSource?: FeeSource,
): Promise<string> {
  const controller: Controller | undefined = window.controller;

  if (!controller) {
    throw new Error("Controller not found");
  }

  const calls = normalizeCalls(transactions);

  // Try paymaster flow
  try {
    const { transaction_hash } = await controller.executeFromOutsideV3(
      calls,
      feeSource,
    );
    return transaction_hash;
  } catch (e) {
    const error = e as ControllerError;
    if (error.code !== ErrorCode.PaymasterNotSupported) {
      throw error;
    }
  }

  // User pays flow
  const estimate = await controller.estimateInvokeFee(calls);
  const { transaction_hash } = await controller.execute(
    transactions as Call[],
    estimate,
    feeSource,
  );
  return transaction_hash;
}

export function execute({
  navigate,
}: {
  navigate: (
    to: string | number,
    options?: { replace?: boolean; state?: unknown },
  ) => void;
}) {
  return async (
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

        // Check if calls are authorized by stored policies
        if (!(await controller.hasAuthorizedPoliciesForCalls(calls))) {
          const url = createExecuteUrl(toArray(transactions), {
            resolve,
            reject,
          });
          navigate(url, { replace: true });

          return resolve({
            code: ResponseCodes.USER_INTERACTION_REQUIRED,
            message: "User interaction required",
          });
        }

        // Use the consolidated execution logic
        try {
          const transaction_hash = await executeCore(calls, feeSource);
          return resolve({
            code: ResponseCodes.SUCCESS,
            transaction_hash,
          });
        } catch (e) {
          const error = e as ControllerError;
          const parsedError = parseControllerError(error);

          const url = createExecuteUrl(toArray(transactions), {
            error: parsedError,
            resolve,
            reject,
          });
          navigate(url, { replace: true });

          return resolve({
            code: ResponseCodes.ERROR,
            message: error.message,
            error: parsedError,
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
