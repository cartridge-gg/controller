import { describe, expect, it } from "vitest";
import { FeeEstimate } from "starknet";
import { isPartialPaymaster } from "./fee";

describe("isPartialPaymaster", () => {
  it("returns true when all gas fields are zero", () => {
    const estimate = {
      overall_fee: "0x1",
      l1_gas_consumed: "0x0",
      l1_gas_price: "0x0",
      l2_gas_consumed: "0x0",
      l2_gas_price: "0x0",
      l1_data_gas_consumed: "0x0",
      l1_data_gas_price: "0x0",
    } as FeeEstimate;

    expect(isPartialPaymaster(estimate)).toBe(true);
  });

  it("returns false when any gas field is non-zero", () => {
    const estimate = {
      overall_fee: "0x1",
      l1_gas_consumed: "0x0",
      l1_gas_price: "0x1",
      l2_gas_consumed: "0x0",
      l2_gas_price: "0x0",
      l1_data_gas_consumed: "0x0",
      l1_data_gas_price: "0x0",
    } as FeeEstimate;

    expect(isPartialPaymaster(estimate)).toBe(false);
  });

  it("treats missing gas fields as zero", () => {
    const estimate = {
      overall_fee: "0x1",
    } as FeeEstimate;

    expect(isPartialPaymaster(estimate)).toBe(true);
  });
});
