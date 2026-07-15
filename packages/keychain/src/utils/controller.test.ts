import { describe, expect, it } from "vitest";
import { toStarknetFeeEstimate } from "./controller";

describe("toStarknetFeeEstimate", () => {
  it("returns a plain v10 fee payload with string fields and FRI units", () => {
    expect(
      toStarknetFeeEstimate({
        l1_gas_consumed: 100,
        l1_gas_price: 200,
        l2_gas_consumed: 300,
        l2_gas_price: 400,
        l1_data_gas_consumed: 500,
        l1_data_gas_price: 600,
        overall_fee: 800,
      }),
    ).toEqual({
      l1_gas_consumed: "150",
      l1_gas_price: "300",
      l2_gas_consumed: "450",
      l2_gas_price: "600",
      l1_data_gas_consumed: "750",
      l1_data_gas_price: "900",
      overall_fee: "1800",
      unit: "FRI",
    });
  });
});
