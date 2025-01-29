import { EstimateFee } from "starknet";
import { JsFeeEstimate } from "@cartridge/account-wasm/controller";

export function toJsFeeEstimate(fee?: EstimateFee): JsFeeEstimate | undefined {
  if (!fee) return undefined;

  return {
    gas_consumed: fee.gas_consumed.toString(),
    gas_price: fee.gas_price.toString(),
    overall_fee: fee.overall_fee.toString(),
    unit: fee.unit,
    data_gas_consumed: fee.data_gas_consumed?.toString(),
    data_gas_price: fee.data_gas_price?.toString(),
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
