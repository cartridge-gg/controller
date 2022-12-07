import {
  Call,
  DeclareContractPayload,
  EstimateFee,
  EstimateFeeDetails,
} from "starknet";
import { StarknetChainId } from "starknet/src/constants";

import Controller from "utils/controller";

const estimateInvokeFee =
  (controller: Controller) =>
    async (
      transactions: Call | Call[],
      details?: EstimateFeeDetails & {
        chainId: StarknetChainId
      },
    ): Promise<EstimateFee> => {
      const calls = Array.isArray(transactions) ? transactions : [transactions];
      return await controller.account(details.chainId).estimateInvokeFee(calls, details);
    };

const estimateDeclareFee =
  (controller: Controller) =>
    async (
      payload: DeclareContractPayload,
      details?: EstimateFeeDetails & {
        chainId: StarknetChainId
      },
    ): Promise<EstimateFee> => {
      return await controller.account(details.chainId).estimateDeclareFee(payload, details);
    };

export { estimateDeclareFee, estimateInvokeFee };
