import { Call, FeeEstimate, UniversalDetails } from "starknet";

export function estimateInvokeFee() {
  return async (
    transactions: Call[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _details?: UniversalDetails,
  ): Promise<FeeEstimate | undefined> => {
    return await window.controller?.estimateInvokeFee(transactions);
  };
}
