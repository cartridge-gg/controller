import {
  constants,
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

const estimateDeclareFee =
  (controller: Controller) =>
  async (
    payload: DeclareContractPayload,
    details?: EstimateFeeDetails & {
      chainId: constants.StarknetChainId;
    },
  ): Promise<EstimateFee> => {
    return await controller
      .account(details.chainId)
      .estimateDeclareFee(payload, details);
  };

export { estimateDeclareFee, estimateInvokeFee };
