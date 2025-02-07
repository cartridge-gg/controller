import {
  Call,
  DeclareContractPayload,
  EstimateFee,
  EstimateFeeDetails,
} from "starknet";

export function estimateInvokeFee() {
  return async (
    transactions: Call[],
    details?: EstimateFeeDetails,
  ): Promise<EstimateFee | undefined> => {
    return await window.controller?.estimateInvokeFee(transactions, details);
  };
}

export function estimateDeclareFee() {
  return async (
    payload: DeclareContractPayload,
    details?: EstimateFeeDetails,
  ): Promise<EstimateFee | undefined> => {
    return await window.controller?.estimateDeclareFee(payload, details);
  };
}
