import { JsFeeEstimate } from "@cartridge/controller-wasm/controller";
import { EstimateFeeResponseOverhead } from "starknet";

export function toJsFeeEstimate(
  fee?: EstimateFeeResponseOverhead,
): JsFeeEstimate | undefined {
  // If the overall_fee is 0n then it is a free txn
  if (!fee || fee.overall_fee == 0n) return undefined;

  const l1_gas = fee.resourceBounds?.l1_gas;
  const l2_gas = fee.resourceBounds?.l2_gas;
  const l1_data_gas = fee.resourceBounds?.l1_data_gas;

  return {
    l1_gas_consumed: l1_gas ? Number(l1_gas.max_amount) : 0,
    l1_gas_price: l1_gas ? Number(l1_gas.max_price_per_unit) : 0,
    l2_gas_consumed: l2_gas ? Number(l2_gas.max_amount) : 0,
    l2_gas_price: l2_gas ? Number(l2_gas.max_price_per_unit) : 0,
    overall_fee: Number(fee.overall_fee),
    unit: fee.unit,
    l1_data_gas_consumed: l1_data_gas ? Number(l1_data_gas.max_amount) : 0,
    l1_data_gas_price: l1_data_gas ? Number(l1_data_gas.max_price_per_unit) : 0,
  };
}

export function fromJsFeeEstimate(
  fee: JsFeeEstimate,
): EstimateFeeResponseOverhead {
  return {
    overall_fee: BigInt(fee.overall_fee),
    unit: fee.unit,
    resourceBounds: {
      l1_gas: {
        max_amount: BigInt(fee.l1_gas_consumed || 0),
        max_price_per_unit: BigInt(fee.l1_gas_price || 0),
      },
      l2_gas: {
        max_amount: BigInt(fee.l2_gas_consumed || 0),
        max_price_per_unit: BigInt(fee.l2_gas_price || 0),
      },
      l1_data_gas: {
        max_amount: BigInt(fee.l1_data_gas_consumed || 0),
        max_price_per_unit: BigInt(fee.l1_data_gas_price || 0),
      },
    },
  };
}
