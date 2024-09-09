import {
  ResponseCodes,
  ConnectError,
  PaymasterOptions,
} from "@cartridge/controller";
import Controller from "utils/controller";
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
import { ConnectionCtx, ExecuteCtx } from "./types";
import { ErrorType, JsCall } from "@cartridge/account-wasm";

export const ESTIMATE_FEE_PERCENTAGE = 10;

export function execute({
  setContext,
}: {
  setContext: (context: ConnectionCtx) => void;
}) {
  return (controller: Controller, origin: string) =>
    async (
      transactions: AllowArray<Call>,
      abis: Abi[],
      transactionsDetail?: InvocationsDetails,
      sync?: boolean,
      paymaster?: PaymasterOptions,
    ): Promise<InvokeFunctionResponse | ConnectError> => {
      const account = controller.account;
      const calls = normalizeCalls(transactions);

      if (sync) {
        return await new Promise((resolve, reject) => {
          setContext({
            type: "execute",
            origin,
            transactions,
            abis,
            transactionsDetail,
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
        if (paymaster) {
          try {
            const transaction_hash = await account.executeFromOutside(
              calls,
              paymaster,
            );

            return resolve({
              code: ResponseCodes.SUCCESS,
              transaction_hash,
            });
          } catch (e) {
            // User only pays if the error is ErrorType.PaymasterNotSupported
            if (e.error_type !== ErrorType.PaymasterNotSupported) {
              setContext({
                type: "execute",
                origin,
                transactions,
                abis,
                transactionsDetail,
                error: {
                  error_type: e.error_type,
                  message: e.message,
                  details: e.details,
                },
                resolve,
                reject,
              } as ExecuteCtx);
              return resolve({
                code: ResponseCodes.ERROR,
                message: e.message,
                error: {
                  error_type: e.error_type,
                  message: e.message,
                  details: e.details,
                },
              });
            }
          }
        }

        try {
          let { maxFee } = transactionsDetail;
          if (!maxFee) {
            let estimate = await account.cartridge.estimateInvokeFee(calls);
            maxFee = num.toHex(
              num.addPercent(estimate.overall_fee, ESTIMATE_FEE_PERCENTAGE),
            );
          }

          let res = await account.execute(transactions, { maxFee });
          return resolve({
            code: ResponseCodes.SUCCESS,
            transaction_hash: res.transaction_hash,
          });
        } catch (e) {
          setContext({
            type: "execute",
            origin,
            transactions,
            abis,
            transactionsDetail,
            error: {
              error_type: e.error_type,
              message: e.message,
              details: e.details,
            },
            resolve,
            reject,
          } as ExecuteCtx);
          return resolve({
            code: ResponseCodes.ERROR,
            message: e.message,
            error: {
              error_type: e.error_type,
              message: e.message,
              details: e.details,
            },
          });
        }
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
