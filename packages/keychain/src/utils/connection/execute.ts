import { ResponseCodes, ConnectError } from "@cartridge/controller";
import {
  Abi,
  AllowArray,
  Call,
  CallData,
  InvocationsDetails,
  InvokeFunctionResponse,
  addAddressPadding,
  num,
} from "starknet";
import { ConnectionCtx, ControllerError, ExecuteCtx } from "./types";
import { ErrorCode, JsCall } from "@cartridge/account-wasm/controller";
import { mutex } from "./sync";

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
  } catch (e: any) {
    return {
      code: controllerError.code,
      message: controllerError.message,
      data: { execution_error: controllerError.data },
    };
  }
}

export function execute({
  setContext,
}: {
  setContext: (context: ConnectionCtx) => void;
}) {
  return async (
    transactions: AllowArray<Call>,
    abis: Abi[],
    transactionsDetail?: InvocationsDetails,
    sync?: boolean,
    _?: any,
    error?: ControllerError,
  ): Promise<InvokeFunctionResponse | ConnectError> => {
    const account = window.controller;
    const calls = normalizeCalls(transactions);

    if (sync) {
      return await new Promise((resolve, reject) => {
        setContext({
          type: "execute",
          origin,
          transactions,
          abis,
          transactionsDetail,
          error,
          resolve,
          reject,
        } as ExecuteCtx);
      });
    }

    const release = await mutex.obtain();
    return await new Promise<InvokeFunctionResponse | ConnectError>(
      async (resolve, reject) => {
        // If a session call and there is no session available
        // fallback to manual apporval flow
        if (!account.hasSession(calls)) {
          setContext({
            type: "execute",
            origin,
            transactions,
            abis,
            transactionsDetail,
            resolve,
            reject,
          } as ExecuteCtx);

          return resolve({
            code: ResponseCodes.USER_INTERACTION_REQUIRED,
            message: "User interaction required",
          });
        }

        // Try paymaster if it is enabled. If it fails, fallback to user pays session flow.
        try {
          const { transaction_hash } = await account.executeFromOutsideV3(
            calls,
          );

          return resolve({
            code: ResponseCodes.SUCCESS,
            transaction_hash,
          });
        } catch (e) {
          // User only pays if the error is ErrorCode.PaymasterNotSupported
          if (e.code !== ErrorCode.PaymasterNotSupported) {
            setContext({
              type: "execute",
              origin,
              transactions,
              abis,
              transactionsDetail,
              error: parseControllerError(e),
              resolve,
              reject,
            } as ExecuteCtx);
            return resolve({
              code: ResponseCodes.ERROR,
              message: e.message,
              error: parseControllerError(e),
            });
          }
        }

        try {
          let estimate = await account.cartridge.estimateInvokeFee(calls);
          const maxFee = num.toHex(
            num.addPercent(estimate.overall_fee, ESTIMATE_FEE_PERCENTAGE),
          );

          let { transaction_hash } = await account.execute(transactions, {
            maxFee,
          });
          return resolve({
            code: ResponseCodes.SUCCESS,
            transaction_hash,
          });
        } catch (e) {
          console.log(e);
          setContext({
            type: "execute",
            origin,
            transactions,
            abis,
            transactionsDetail,
            error: parseControllerError(e),
            resolve,
            reject,
          } as ExecuteCtx);
          return resolve({
            code: ResponseCodes.ERROR,
            message: e.message,
            error: parseControllerError(e),
          });
        }
      },
    ).finally(() => {
      release();
    });
  };
}

export const normalizeCalls = (calls: AllowArray<Call>): JsCall[] => {
  return (Array.isArray(calls) ? calls : [calls]).map((call) => {
    return {
      entrypoint: call.entrypoint,
      contractAddress: addAddressPadding(call.contractAddress),
      calldata: CallData.toHex(call.calldata),
    };
  });
};
