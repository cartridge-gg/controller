import {
  Call,
  EstimateFeeResponseOverhead,
  InvocationsDetails,
} from "starknet";

export function estimateInvokeFee() {
  return async (
    transactions: Call[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _details?: InvocationsDetails,
  ): Promise<EstimateFeeResponseOverhead | undefined> => {
    return await window.controller?.estimateInvokeFee(transactions);
  };
}
