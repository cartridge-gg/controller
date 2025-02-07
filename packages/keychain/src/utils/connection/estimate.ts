import { Call, EstimateFee, EstimateFeeDetails } from "starknet";

export function estimateInvokeFee() {
  return async (
    transactions: Call[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _details?: EstimateFeeDetails,
  ): Promise<EstimateFee | undefined> => {
    return await window.controller?.estimateInvokeFee(transactions);
  };
}
