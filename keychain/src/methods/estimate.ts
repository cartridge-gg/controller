import {
  Call,
  DeclareContractPayload,
  EstimateFee,
  EstimateFeeDetails,
} from "starknet";

import Controller from "utils/account";

const estimateInvokeFee = (controller: Controller) => async (transactions: Call | Call[], details?: EstimateFeeDetails): Promise<EstimateFee> => {
  const calls = Array.isArray(transactions) ? transactions : [transactions];
  return await controller.estimateInvokeFee(calls, details);
}

const estimateDeclareFee = (controller: Controller) => async (payload: DeclareContractPayload, details?: EstimateFeeDetails): Promise<EstimateFee> => {
  return await controller.estimateDeclareFee(payload, details);
}

export { estimateDeclareFee, estimateInvokeFee };
