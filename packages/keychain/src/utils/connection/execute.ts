import {
  ExecuteReply,
  Policy,
  ResponseCodes,
  ConnectError,
} from "@cartridge/controller";
import Controller, { diff } from "utils/controller";
import { Abi, Call, InvocationsDetails, addAddressPadding } from "starknet";
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
      const account = controller.account;
      if (
        account.status === Status.COUNTERFACTUAL ||
        account.status === Status.DEPLOYING
      ) {
        return Promise.resolve({
          code: ResponseCodes.NOT_ALLOWED,
          message: "Account is deploying.",
        });
      }

      const calls = Array.isArray(transactions) ? transactions : [transactions];
      const policies = calls.map(
        (txn) =>
          ({
            target: addAddressPadding(txn.contractAddress),
            method: txn.entrypoint,
          } as Policy),
      );

      const session = controller.session(origin);
      if (!session) {
        return Promise.resolve({
          code: ResponseCodes.NOT_ALLOWED,
          message: `No session`,
        });
      }

      const missing = diff(policies, session.policies);
      if (missing.length > 0) {
        return Promise.resolve({
          code: ResponseCodes.NOT_ALLOWED,
          message: `Missing policies: ${JSON.stringify(missing)}`,
        });
      }

      // Try execute from outside for fee subsized transactions
      try {
        const res= await controller.account.cartridge.executeFromOutside(
          calls as Array<Call>,
          session,
        );
        return {
          code: ResponseCodes.SUCCESS,
          ...res,
        };
      } catch (e) {
        /* do nothing */
      }

      if (!transactionsDetail.maxFee) {
        try {
          const estFee = await account.estimateInvokeFee(calls, {
            nonce: transactionsDetail.nonce,
          });

          transactionsDetail.maxFee = estFee.suggestedMaxFee;
        } catch (e) {
          return Promise.resolve({
            code: ResponseCodes.NOT_ALLOWED,
            message: e.message,
          });
        }
      }

      if (
        session.maxFee &&
        transactionsDetail &&
        BigInt(transactionsDetail.maxFee) > BigInt(session.maxFee)
      ) {
        return Promise.resolve({
          code: ResponseCodes.NOT_ALLOWED,
          message: `Max fee exceeded: ${transactionsDetail.maxFee.toString()} > ${session.maxFee.toString()}`,
        });
      }

      try {
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
