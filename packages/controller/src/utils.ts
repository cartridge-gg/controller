import { addAddressPadding, Call, CallData } from "starknet";

export function normalizeCalls(calls: Call | Call[]) {
  return (Array.isArray(calls) ? calls : [calls]).map((call) => {
    return {
      entrypoint: call.entrypoint,
      contractAddress: addAddressPadding(call.contractAddress),
      calldata: CallData.toHex(call.calldata),
    };
  });
}
