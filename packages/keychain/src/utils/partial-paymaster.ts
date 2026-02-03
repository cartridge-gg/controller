import { STRK_CONTRACT_ADDRESS } from "@cartridge/ui/utils";
import { Call, CallData, cairo, FeeEstimate } from "starknet";

export const PARTIAL_PAYMASTER_FEE_RECIPIENT =
  "0x02d2e564dd4faa14277fefd0d8cb95e83b13c0353170eb6819ec35bf1bee8e2a";

const toBigIntOrZero = (value: unknown): bigint => {
  if (value === null || value === undefined) {
    return 0n;
  }

  if (typeof value === "bigint") {
    return value;
  }

  if (typeof value === "number") {
    return BigInt(Math.trunc(value));
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return 0n;
    }

    try {
      return BigInt(trimmed);
    } catch {
      return 0n;
    }
  }

  return 0n;
};

export function buildPartialPaymasterCalls(
  calls: Call[],
  feeEstimate: FeeEstimate,
  options: { order?: "append" | "prepend" } = {},
): Call[] {
  const overallFee = toBigIntOrZero(feeEstimate.overall_fee);

  if (overallFee === 0n) {
    return calls;
  }

  const feeTransfer: Call = {
    contractAddress: STRK_CONTRACT_ADDRESS,
    entrypoint: "transfer",
    calldata: CallData.compile({
      recipient: PARTIAL_PAYMASTER_FEE_RECIPIENT,
      amount: cairo.uint256(overallFee),
    }),
  };

  if (options.order === "prepend") {
    return [feeTransfer, ...calls];
  }

  return [...calls, feeTransfer];
}
