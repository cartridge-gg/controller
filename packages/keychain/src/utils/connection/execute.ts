import { ResponseCodes, ConnectError } from "@cartridge/controller";
import { Call, InvokeFunctionResponse, num } from "starknet";
import { ConnectionCtx, ControllerError, ExecuteCtx } from "./types";
import { ErrorCode } from "@cartridge/account-wasm/controller";

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
    calls: Call[],
    sync?: boolean,
    error?: ControllerError,
  ): Promise<InvokeFunctionResponse | ConnectError> => {
    const account = window.controller;

    if (sync) {
      return await new Promise((resolve, reject) => {
        setContext({
          type: "execute",
          origin,
          calls,
          error,
          resolve,
          reject,
        } as ExecuteCtx);
      });
    }

    return await new Promise(async (resolve, reject) => {
      // If a session call and there is no session available
      // fallback to manual apporval flow
      if (!account.hasSession(calls)) {
        setContext({
          type: "execute",
          origin,
          calls,
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
        const { transaction_hash } = await account.executeFromOutsideV3(calls);

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
            calls,
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
        let maxFee = num.toHex(
          num.addPercent(estimate.overall_fee, ESTIMATE_FEE_PERCENTAGE),
        );

        let { transaction_hash } = await account.execute(calls, {
          maxFee,
        });
        return resolve({
          code: ResponseCodes.SUCCESS,
          transaction_hash,
        });
      } catch (e) {
        setContext({
          type: "execute",
          origin,
          calls,
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
    });
  };
}
