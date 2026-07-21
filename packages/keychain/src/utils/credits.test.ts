import { describe, expect, it } from "vitest";
import {
  creditsTopupAmountUsd,
  shouldOpenCreditsDeposit,
} from "./credits-topup";

describe("shouldOpenCreditsDeposit", () => {
  it("always routes card purchases through credits deposit", () => {
    expect(shouldOpenCreditsDeposit("coinflow", false)).toBe(true);
    expect(shouldOpenCreditsDeposit("coinflow", true)).toBe(true);
  });

  it("only tops up direct credits purchases when their balance is short", () => {
    expect(shouldOpenCreditsDeposit("credits", false)).toBe(true);
    expect(shouldOpenCreditsDeposit("credits", true)).toBe(false);
    expect(shouldOpenCreditsDeposit("onchain", false)).toBe(false);
  });
});

describe("creditsTopupAmountUsd", () => {
  it("subtracts the existing balance and rounds the shortfall up to a cent", () => {
    expect(
      creditsTopupAmountUsd({
        requiredCredits: 1_000_000_001n,
        creditsBalance: 450_000_000n,
        minimumAmount: 5,
      }),
    ).toBe(5.51);
  });

  it("enforces the deposit minimum when the shortfall is smaller", () => {
    expect(
      creditsTopupAmountUsd({
        requiredCredits: 200_000_000n,
        creditsBalance: 0n,
        minimumAmount: 5,
      }),
    ).toBe(5);
  });

  it("still returns the minimum when the account already has enough credits", () => {
    expect(
      creditsTopupAmountUsd({
        requiredCredits: 200_000_000n,
        creditsBalance: 300_000_000n,
        minimumAmount: 5,
      }),
    ).toBe(5);
  });
});
