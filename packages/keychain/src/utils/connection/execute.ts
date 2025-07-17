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
import { ConnectionCtx, ControllerError, ExecuteCtx } from "./types";
import { ErrorCode, JsCall } from "@cartridge/controller-wasm/controller";
import { mutex } from "./sync";
import Controller from "../controller";

export const ESTIMATE_FEE_PERCENTAGE = 10;

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
  setContext,
}: {
  setContext: (context: ConnectionCtx | undefined) => void;
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
        setContext({
          type: "execute",
          transactions,
          error,
          resolve,
          reject,
        } as ExecuteCtx);
      });
    }

    const release = await mutex.obtain();
    return await new Promise<InvokeFunctionResponse | ConnectError>(
      // eslint-disable-next-line no-async-promise-executor
      async (resolve, reject) => {
        const controller: Controller | undefined = window.controller;

        if (!controller) {
          setContext(undefined);
          return reject({
            message: "Controller context not available",
          });
        }

        // Check if calls are authorized by stored policies
        if (!(await controller.hasAuthorizedPoliciesForCalls(calls))) {
          setContext({
            type: "execute",
            transactions,
            resolve,
            reject,
          } as ExecuteCtx);

          return resolve({
            code: ResponseCodes.USER_INTERACTION_REQUIRED,
            message: "User interaction required",
          });
        }

        // Use the consolidated execution logic
        try {
          const transaction_hash = await executeCore(calls, feeSource);
          setContext(undefined);
          return resolve({
            code: ResponseCodes.SUCCESS,
            transaction_hash,
          });
        } catch (e) {
          const error = e as ControllerError;
          setContext({
            type: "execute",
            transactions,
            error: parseControllerError(error),
            resolve,
            reject,
          } as ExecuteCtx);
          return resolve({
            code: ResponseCodes.ERROR,
            message: error.message,
            error: parseControllerError(error),
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
