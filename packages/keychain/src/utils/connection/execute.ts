import {
  ExecuteReply,
  Policy,
  ResponseCodes,
  ConnectError,
  PaymasterOptions,
} from "@cartridge/controller";
import Controller, { diff } from "utils/controller";
import {
  AllowArray,
  Call,
  CallData,
  InvocationsDetails,
  addAddressPadding,
} from "starknet";
import { Status } from "utils/account";
import { ConnectionCtx, ExecuteCtx } from "./types";

export function executeFactory({
  setContext,
}: {
  setContext: (context: ConnectionCtx) => void;
}) {
  return (controller: Controller, origin: string) =>
    async (
      transactions: AllowArray<Call>,
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
            transactionsDetail,
            resolve,
            reject,
          } as ExecuteCtx);
        });
      }

      try {
        const account = controller.account;
        if (account.status !== Status.DEPLOYED) {
          throw new Error("Account is deploying.");
        }

        const session = controller.session(origin);
        if (!session) {
          throw new Error("No session");
        }

        const missing = diff(mapPolicies(transactions), session.policies);
        if (missing.length > 0) {
          throw new Error(`Missing policies: ${JSON.stringify(missing)}`);
        }

        if (paymaster) {
          try {
            const { transaction_hash } =
              await controller.account.cartridge.executeFromOutside(
                normalizeCalls(transactions),
                paymaster.caller,
                session,
              );
            return {
              code: ResponseCodes.SUCCESS,
              transaction_hash,
            };
          } catch (e) {
            /* user pays */
          }
        }

        if (!transactionsDetail.maxFee) {
          const estFee = await account.estimateInvokeFee(
            transactions,
            {
              nonce: transactionsDetail.nonce,
            },
            session,
          );
          transactionsDetail.maxFee = estFee.suggestedMaxFee;
        }

        if (
          session.maxFee &&
          transactionsDetail &&
          BigInt(transactionsDetail.maxFee) > BigInt(session.maxFee)
        ) {
          throw new Error(
            `Max fee exceeded: ${transactionsDetail.maxFee.toString()} > ${session.maxFee.toString()}`,
          );
        }

        const res = await account.execute(
          transactions,
          transactionsDetail,
          session,
        );

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

export const mapPolicies = (calls: AllowArray<Call>): Policy[] => {
  return (Array.isArray(calls) ? calls : [calls]).map((call) => {
    return {
      target: addAddressPadding(call.contractAddress),
      method: call.entrypoint,
    } as Policy;
  });
};
