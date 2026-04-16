import { describe, it, expect } from "vitest";
import {
  formatUsdValue,
  formatTokenValue,
  formatUsdValueDifference,
} from "./format-value";

describe("formatUsdValue", () => {
  it("zero", () => {
    expect(formatUsdValue(0)).toBe("$0.00");
  });
  it("null", () => {
    expect(formatUsdValue(null)).toBe("$0.00");
  });
  it("undefined", () => {
    expect(formatUsdValue(undefined)).toBe("$0.00");
  });
  it("+ small integer", () => {
    expect(formatUsdValue(1)).toBe("$1.00");
  });
  it("+ large integer", () => {
    expect(formatUsdValue(12345)).toBe("$12345.00");
  });
  it("+ one decimal", () => {
    expect(formatUsdValue(1.1)).toBe("$1.10");
  });
  it("+ two decimals", () => {
    expect(formatUsdValue(1.12)).toBe("$1.12");
  });
  it("+ three decimals", () => {
    expect(formatUsdValue(1.123)).toBe("$1.12");
  });
  it("+ ignore decimals", () => {
    expect(formatUsdValue(1.001)).toBe("$1.00");
  });
  it("+ rounded decimals", () => {
    expect(formatUsdValue(1.009)).toBe("$1.01");
  });
  it("+ small decimals", () => {
    expect(formatUsdValue(0.009)).toBe("<$0.01");
  });
  it("- small integer", () => {
    expect(formatUsdValue(-1)).toBe("-$1.00");
  });
  it("- large integer", () => {
    expect(formatUsdValue(-12345)).toBe("-$12345.00");
  });
  it("- one decimal", () => {
    expect(formatUsdValue(-1.1)).toBe("-$1.10");
  });
  it("- two decimals", () => {
    expect(formatUsdValue(-1.12)).toBe("-$1.12");
  });
  it("- three decimals", () => {
    expect(formatUsdValue(-1.123)).toBe("-$1.12");
  });
  it("- ignore decimals", () => {
    expect(formatUsdValue(-1.001)).toBe("-$1.00");
  });
  it("- rounded decimals", () => {
    expect(formatUsdValue(-1.009)).toBe("-$1.01");
  });
  it("- small decimals", () => {
    expect(formatUsdValue(-0.009)).toBe("<-$0.01");
  });
});

describe("formatUsdValueDifference", () => {
  it("+ zero", () => {
    expect(formatUsdValueDifference(0)).toBe("+$0.00");
  });
  it("+ null", () => {
    expect(formatUsdValueDifference(null)).toBe("+$0.00");
  });
  it("+ undefined", () => {
    expect(formatUsdValueDifference(undefined)).toBe("+$0.00");
  });
  it("+ small integer", () => {
    expect(formatUsdValueDifference(1)).toBe("+$1.00");
  });
  it("+ large integer", () => {
    expect(formatUsdValueDifference(12345)).toBe("+$12345.00");
  });
  it("+ one decimal", () => {
    expect(formatUsdValueDifference(1.1)).toBe("+$1.10");
  });
  it("+ two decimals", () => {
    expect(formatUsdValueDifference(1.12)).toBe("+$1.12");
  });
  it("+ three decimals", () => {
    expect(formatUsdValueDifference(1.123)).toBe("+$1.12");
  });
  it("+ ignore decimals", () => {
    expect(formatUsdValueDifference(1.001)).toBe("+$1.00");
  });
  it("+ rounded decimals", () => {
    expect(formatUsdValueDifference(1.009)).toBe("+$1.01");
  });
  it("+ small decimals", () => {
    expect(formatUsdValueDifference(0.009)).toBe("+$0.01");
  });
  it("- small integer", () => {
    expect(formatUsdValueDifference(-1)).toBe("-$1.00");
  });
  it("- large integer", () => {
    expect(formatUsdValueDifference(-12345)).toBe("-$12345.00");
  });
  it("- one decimal", () => {
    expect(formatUsdValueDifference(-1.1)).toBe("-$1.10");
  });
  it("- two decimals", () => {
    expect(formatUsdValueDifference(-1.12)).toBe("-$1.12");
  });
  it("- three decimals", () => {
    expect(formatUsdValueDifference(-1.123)).toBe("-$1.12");
  });
  it("- ignore decimals", () => {
    expect(formatUsdValueDifference(-1.001)).toBe("-$1.00");
  });
  it("- rounded decimals", () => {
    expect(formatUsdValueDifference(-1.009)).toBe("-$1.01");
  });
  it("- small decimals", () => {
    expect(formatUsdValueDifference(-0.009)).toBe("-$0.01");
  });
});

describe("formatTokenValue", () => {
  it("+ small integer", () => {
    expect(formatTokenValue(1, 2, "ETH")).toBe("1 ETH");
  });
  it("+ large integer", () => {
    expect(formatTokenValue(12345, 2, "ETH")).toBe("12345 ETH");
  });
  it("+ one decimal", () => {
    expect(formatTokenValue(1.1, 2, "ETH")).toBe("1.1 ETH");
  });
  it("+ two decimals", () => {
    expect(formatTokenValue(1.12, 2, "ETH")).toBe("1.12 ETH");
  });
  it("+ three decimals", () => {
    expect(formatTokenValue(1.123, 2, "ETH")).toBe("1.12 ETH");
  });
  it("+ ignore decimals", () => {
    expect(formatTokenValue(1.001, 2, "ETH")).toBe("1 ETH");
  });
  it("+ rounded decimals", () => {
    expect(formatTokenValue(1.009, 2, "ETH")).toBe("1.01 ETH");
  });
  it("+ small decimals", () => {
    expect(formatTokenValue(0.009, 2, "ETH")).toBe("<0.01 ETH");
  });
  it("- small integer", () => {
    expect(formatTokenValue(-1, 2, "ETH")).toBe("-1 ETH");
  });
  it("- large integer", () => {
    expect(formatTokenValue(-12345, 2, "ETH")).toBe("-12345 ETH");
  });
  it("- one decimal", () => {
    expect(formatTokenValue(-1.1, 2, "ETH")).toBe("-1.1 ETH");
  });
  it("- two decimals", () => {
    expect(formatTokenValue(-1.12, 2, "ETH")).toBe("-1.12 ETH");
  });
  it("- three decimals", () => {
    expect(formatTokenValue(-1.123, 2, "ETH")).toBe("-1.12 ETH");
  });
  it("- ignore decimals", () => {
    expect(formatTokenValue(-1.001, 2, "ETH")).toBe("-1 ETH");
  });
  it("- rounded decimals", () => {
    expect(formatTokenValue(-1.009, 2, "ETH")).toBe("-1.01 ETH");
  });
  it("- small decimals", () => {
    expect(formatTokenValue(-0.009, 2, "ETH")).toBe("<-0.01 ETH");
  });
});
