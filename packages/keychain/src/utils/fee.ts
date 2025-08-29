import { JsFeeEstimate } from "@cartridge/controller-wasm/controller";
import { FeeEstimate } from "starknet";

export function toJsFeeEstimate(fee?: FeeEstimate): JsFeeEstimate | undefined {
  // If the overall_fee is 0 then it is a free txn
  if (!fee || Number(fee.overall_fee) === 0) return undefined;

  return {
    l1_gas_consumed: Number(fee.l1_gas_consumed),
    l1_gas_price: Number(fee.l1_gas_price),
    l2_gas_consumed: Number(fee.l2_gas_consumed),
    l2_gas_price: Number(fee.l2_gas_price),
    overall_fee: Number(fee.overall_fee),
    l1_data_gas_consumed: Number(fee.l1_data_gas_consumed),
    l1_data_gas_price: Number(fee.l1_data_gas_price),
  };
}
