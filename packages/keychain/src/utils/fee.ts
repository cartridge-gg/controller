import { JsFeeEstimate } from "@cartridge/controller-wasm/controller";
import { EstimateFee } from "starknet";

export function toJsFeeEstimate(fee?: EstimateFee): JsFeeEstimate | undefined {
  // If the overall_fee is 0n then it is a free txn
  if (!fee || fee.overall_fee == 0n) return undefined;

  return {
    l1_gas_consumed: Number(fee.l1_gas_consumed),
    l1_gas_price: Number(fee.l1_gas_price),
    l2_gas_consumed: Number(fee.l2_gas_consumed),
    l2_gas_price: Number(fee.l2_gas_price),
    overall_fee: Number(fee.overall_fee),
    unit: fee.unit,
    l1_data_gas_consumed: Number(fee.l1_data_gas_consumed),
    l1_data_gas_price: Number(fee.l1_data_gas_price),
  };
}

export function fromJsFeeEstimate(fee: JsFeeEstimate): EstimateFee {
  return {
    l2_gas_consumed: BigInt(fee.l2_gas_consumed),
    l2_gas_price: BigInt(fee.l2_gas_price),
    overall_fee: BigInt(fee.overall_fee),
    unit: fee.unit,
    l1_gas_consumed: BigInt(fee.l1_gas_consumed),
    l1_gas_price: BigInt(fee.l1_gas_price),
    l1_data_gas_consumed: BigInt(fee.l1_data_gas_consumed),
    l1_data_gas_price: BigInt(fee.l1_data_gas_price),
    suggestedMaxFee: BigInt(fee.overall_fee),
    resourceBounds: {
      l1_gas: {
        max_amount: "0x0",
        max_price_per_unit: "0x0",
      },
      l2_gas: {
        max_amount: "0x0",
        max_price_per_unit: "0x0",
      },
    },
  };
}
