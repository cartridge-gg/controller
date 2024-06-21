import {
  ExecuteReply,
  Policy,
  ResponseCodes,
  ConnectError,
} from "@cartridge/controller";
import Controller, { diff } from "utils/controller";
import {
  Abi,
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
      transactions: Call | Call[],
      abis?: Abi[],
      transactionsDetail?: InvocationsDetails & {
        chainId?: string;
      },
      sync?: boolean,
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
        if (account.status !== Status.DEPLOYED) {
          throw new Error("Account is deploying.");
        }

        const session = controller.session(origin);
        if (!session) {
          throw new Error("No session");
        }

        const calls = normalizeCalls(transactions);

        const missing = diff(mapPolicies(calls), session.policies);
        if (missing.length > 0) {
          throw new Error(`Missing policies: ${JSON.stringify(missing)}`);
        }

        try {
          const { transaction_hash } =
            await account.cartridge.executeFromOutside(calls, session);
          return {
            code: ResponseCodes.SUCCESS,
            transaction_hash,
          };
        } catch (e) {
          /* do nothing */
        }

        if (!transactionsDetail.maxFee) {
          const estFee = await account.estimateInvokeFee(calls, {
            nonce: transactionsDetail.nonce,
          });
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

        const res = await account.execute(calls, session, transactionsDetail);
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

const normalizeCalls = (calls: Call | Call[]): Call[] => {
  return (Array.isArray(calls) ? calls : [calls]).map((call) => {
    return {
      entrypoint: call.entrypoint,
      contractAddress: addAddressPadding(call.contractAddress),
      calldata: CallData.toHex(call.calldata),
    } as Call;
  });
};

const mapPolicies = (calls: Call[]): Policy[] => {
  return calls.map(
    (txn) =>
      ({
        target: txn.contractAddress,
        method: txn.entrypoint,
      } as Policy),
  );
};
