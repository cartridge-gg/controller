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

export const ESTIMATE_FEE_PERCENTAGE = 10;

export function executeFactory({
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
          console.log("try paymaster")
          try {
            const transaction_hash = await account.executeFromOutside(
              calls,
              paymaster,
            );

            return {
              code: ResponseCodes.SUCCESS,
              transaction_hash,
            };
          } catch (error) {
            /* user pays */
          }
        }

        let { maxFee } = transactionsDetail;
        if (!maxFee) {
          let estFee;
          try {
            estFee = await account.cartridge.estimateInvokeFee(calls);
          } catch (error) {
            if (
              error instanceof Error &&
              error.message.includes("ContractNotFound")
            ) {
              return {
                code: ResponseCodes.NOT_DEPLOYED,
                message: error.message,
              };
            }

            throw error;
          }

          maxFee = num.toHex(
            num.addPercent(estFee.overall_fee, ESTIMATE_FEE_PERCENTAGE),
          );
        }

        let res = await account.execute(transactions, { maxFee });
        return {
          code: ResponseCodes.SUCCESS,
          ...res,
        };
      } catch (e) {
        return {
          code: ResponseCodes.NOT_ALLOWED,
          message: e.message,
        };
      }
    };
}

export const normalizeCalls = (calls: AllowArray<Call>): Call[] => {
  return (Array.isArray(calls) ? calls : [calls]).map((call) => {
    return {
      entrypoint: call.entrypoint,
      contractAddress: addAddressPadding(call.contractAddress),
      calldata: CallData.toHex(call.calldata),
    } as Call;
  });
};
