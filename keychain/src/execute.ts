import { Scope, ExecuteResponse } from "@cartridge/controller";
import {
  Call,
  Abi,
  InvocationsDetails,
  InvokeFunctionResponse,
} from "starknet";
import { toBN } from "starknet/dist/utils/number";

import Controller, { diff } from "utils/account";

export type ExecuteResponsePayload = {
  result?: InvokeFunctionResponse;
  scopes?: Scope[];
  error?: unknown;
};

export async function execute(
  from: string,
  controller: Controller,
  transactions: Call | Call[],
  abis?: Abi[],
  transactionsDetail?: InvocationsDetails,
): Promise<ExecuteResponse> {
  const calls = Array.isArray(transactions) ? transactions : [transactions];

  const scopes = calls.map(
    (txn) =>
    ({
      target: txn.contractAddress,
      method: txn.entrypoint,
    } as Scope),
  );

  try {
    const approvals = await controller.approval(from);
    if (!controller || !approvals) {
      return {
        method: "execute",
        error: "not connected",
      };
    }

    const missing = diff(scopes, approvals.scopes);
    if (missing.length > 0) {
      return {
        method: "execute",
        error: "missing scopes",
        scopes: missing,
      };
    }

    if (transactionsDetail && !transactionsDetail.maxFee) {
      transactionsDetail.maxFee = (
        await controller.estimateFee(calls)
      ).suggestedMaxFee;
    }

    if (
      approvals.maxFee &&
      transactionsDetail?.maxFee.gt(toBN(approvals.maxFee))
    ) {
      return {
        method: "execute",
        error: "transaction fees exceed pre-approved limit",
      };
    }

    const response = await controller.execute(calls, abis, transactionsDetail);
    return {
      method: "execute",
      result: response,
    };
  } catch (error) {
    return {
      method: "execute",
      error,
    };
  }
}
