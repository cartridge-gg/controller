import { EstimateFee } from "starknet";
import { JsFeeEstimate } from "@cartridge/controller-wasm/controller";

export function toJsFeeEstimate(fee?: EstimateFee): JsFeeEstimate | undefined {
  // If the overall_fee is 0n then it is a free txn
  if (!fee || fee.overall_fee == 0n) return undefined;

  return {
    gas_consumed: `0x${fee.gas_consumed.toString(16)}`,
    gas_price: `0x${fee.gas_price.toString(16)}`,
    overall_fee: `0x${fee.overall_fee.toString(16)}`,
    unit: fee.unit,
    data_gas_consumed: fee.data_gas_consumed
      ? `0x${fee.data_gas_consumed.toString(16)}`
      : "0x0",
    data_gas_price: fee.data_gas_price
      ? `0x${fee.data_gas_price.toString(16)}`
      : "0x0",
  };
}

export function fromJsFeeEstimate(fee: JsFeeEstimate): EstimateFee {
  return {
    gas_consumed: BigInt(fee.gas_consumed),
    gas_price: BigInt(fee.gas_price),
    overall_fee: BigInt(fee.overall_fee),
    unit: fee.unit,
    data_gas_consumed: BigInt(fee.data_gas_consumed),
    data_gas_price: BigInt(fee.data_gas_price),
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
