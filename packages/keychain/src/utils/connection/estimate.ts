import {
  Call,
  DeclareContractPayload,
  EstimateFee,
  EstimateFeeDetails,
} from "starknet";

import Controller from "utils/controller";

export function estimateInvokeFee(controller: Controller) {
  return async (
    transactions: Call | Call[],
    details?: EstimateFeeDetails,
  ): Promise<EstimateFee> => {
    const calls = Array.isArray(transactions) ? transactions : [transactions];
    details.blockIdentifier ? details.blockIdentifier : "latest";
    return await controller.account.estimateInvokeFee(calls, details);
  };
}

export function estimateDeclareFee(controller: Controller) {
  return async (
    payload: DeclareContractPayload,
    details?: EstimateFeeDetails,
  ): Promise<EstimateFee> => {
    return await controller.account.estimateDeclareFee(payload, details);
  };
}
