import { describe, expect, it } from "vitest";
import { parseTokenAmount } from "./crypto-fund";

describe("parseTokenAmount", () => {
  it("parses whole token amounts", () => {
    expect(parseTokenAmount("10", 6)).toBe(10_000_000n);
    expect(parseTokenAmount("2", 18)).toBe(2_000_000_000_000_000_000n);
  });

  it("parses fractional token amounts", () => {
    expect(parseTokenAmount("10.25", 6)).toBe(10_250_000n);
    expect(parseTokenAmount("0.000001", 6)).toBe(1n);
  });

  it("rejects invalid precision", () => {
    expect(parseTokenAmount("0.0000001", 6)).toBeUndefined();
    expect(parseTokenAmount("abc", 6)).toBeUndefined();
  });
});
