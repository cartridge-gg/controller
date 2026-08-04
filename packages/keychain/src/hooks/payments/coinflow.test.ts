import { describe, expect, it } from "vitest";
import { resolveCoinflowMainnet } from "./coinflow";

describe("resolveCoinflowMainnet", () => {
  it("uses production Coinflow only on mainnet without a sandbox override", () => {
    expect(resolveCoinflowMainnet(true, false, false)).toBe(true);
  });

  it("uses sandbox when configured on mainnet", () => {
    expect(resolveCoinflowMainnet(true, true, false)).toBe(false);
  });

  it("keeps the local feature override and non-mainnet behavior", () => {
    expect(resolveCoinflowMainnet(true, false, true)).toBe(false);
    expect(resolveCoinflowMainnet(false, false, false)).toBe(false);
  });
});
