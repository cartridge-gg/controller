import { JsFeeEstimate } from "@cartridge/controller-wasm/controller";
import { FeeEstimate } from "starknet";

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

const PARTIAL_PAYMASTER_FIELDS: Array<keyof FeeEstimate> = [
  "l1_gas_consumed",
  "l1_gas_price",
  "l2_gas_consumed",
  "l2_gas_price",
  "l1_data_gas_consumed",
  "l1_data_gas_price",
];

export function isPartialPaymaster(estimate?: FeeEstimate): boolean {
  if (!estimate) {
    return false;
  }

  return PARTIAL_PAYMASTER_FIELDS.every((field) => {
    const value = estimate[field];
    return toBigIntOrZero(value) === 0n;
  });
}

export function toJsFeeEstimate(fee?: FeeEstimate): JsFeeEstimate | undefined {
  // If the overall_fee is 0 then it is a free txn
  const overallFee = toBigIntOrZero(fee?.overall_fee);
  if (!fee || overallFee === 0n) return undefined;

  return {
    l1_gas_consumed: Number(toBigIntOrZero(fee.l1_gas_consumed)),
    l1_gas_price: Number(toBigIntOrZero(fee.l1_gas_price)),
    l2_gas_consumed: Number(toBigIntOrZero(fee.l2_gas_consumed)),
    l2_gas_price: Number(toBigIntOrZero(fee.l2_gas_price)),
    overall_fee: Number(overallFee),
    l1_data_gas_consumed: Number(toBigIntOrZero(fee.l1_data_gas_consumed)),
    l1_data_gas_price: Number(toBigIntOrZero(fee.l1_data_gas_price)),
  };
}
