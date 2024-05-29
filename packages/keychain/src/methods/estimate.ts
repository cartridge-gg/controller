import {
  Call,
  DeclareContractPayload,
  EstimateFee,
  EstimateFeeDetails,
} from "starknet";

import Controller from "utils/controller";

const estimateInvokeFee =
  (controller: Controller) =>
  async (
    transactions: Call | Call[],
    details?: EstimateFeeDetails,
  ): Promise<EstimateFee> => {
    const calls = Array.isArray(transactions) ? transactions : [transactions];
    details.blockIdentifier ? details.blockIdentifier : "latest";
    return await controller.account.estimateInvokeFee(calls, details);
  };

const estimateDeclareFee =
  (controller: Controller) =>
  async (
    payload: DeclareContractPayload,
    details?: EstimateFeeDetails,
  ): Promise<EstimateFee> => {
    return await controller.account.estimateDeclareFee(payload, details);
  };

export { estimateDeclareFee, estimateInvokeFee };
