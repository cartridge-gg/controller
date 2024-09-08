import {
  ExecuteReply,
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
    ): Promise<ExecuteReply | ConnectError> => {
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

      try {
        const account = controller.account;
        const calls = normalizeCalls(transactions);

        if (!account.hasSession(calls)) {
          throw new Error(`No session available`);
        }

        if (paymaster) {
          try {
            const transaction_hash = await account.executeFromOutside(
              calls,
              paymaster,
            );

            return {
              code: ResponseCodes.SUCCESS,
              transaction_hash,
            };
          } catch (e) {
            // User only pays if the error is ErrorType.PaymasterNotSupported
            if (e.error_type !== ErrorType.PaymasterNotSupported) {
              setContext({
                type: "execute",
                origin,
                transactions,
                abis,
                transactionsDetail,
                error: e,
              } as ExecuteCtx);
              throw e;
            }
          }
        }

        let { maxFee } = transactionsDetail;
        if (!maxFee) {
          let res = await account.cartridge.estimateInvokeFee(calls);
          maxFee = num.toHex(
            num.addPercent(res.overall_fee, ESTIMATE_FEE_PERCENTAGE),
          );
        }

        let res = await account.execute(transactions, { maxFee });
        return {
          code: ResponseCodes.SUCCESS,
          ...res,
        };
      } catch (e) {
        return {
          code: ResponseCodes.ERROR,
          message: e.message,
          error: {
            error_type: e.error_type,
            message: e.message,
            details: e.details,
          },
        };
      }
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
