import {
  constants,
  Call,
  DeclareContractPayload,
  EstimateFee,
  EstimateFeeDetails,
} from "starknet";

import Controller from "utils/controller";

export function estimateInvokeFee(controller: Controller) {
  return async (
    transactions: Call | Call[],
    details?: EstimateFeeDetails & {
      chainId: constants.StarknetChainId;
    },
  ): Promise<EstimateFee> => {
    const calls = Array.isArray(transactions) ? transactions : [transactions];
    details.blockIdentifier ? details.blockIdentifier : "latest";
    return await controller
      .account(details.chainId)
      .estimateInvokeFee(calls, details);
  };
}

export function estimateDeclareFee(controller: Controller) {
  return async (
    payload: DeclareContractPayload,
    details?: EstimateFeeDetails & {
      chainId: constants.StarknetChainId;
    },
  ): Promise<EstimateFee> => {
    return await controller
      .account(details.chainId)
      .estimateDeclareFee(payload, details);
  };
}
