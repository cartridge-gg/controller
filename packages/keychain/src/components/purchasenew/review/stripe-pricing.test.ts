import { describe, expect, it } from "vitest";
import { getStripeFeeInCents } from "./stripe-pricing";

describe("starterpack stripe pricing", () => {
  it("calculates the Stripe fee from the starterpack total", () => {
    expect(getStripeFeeInCents(10750)).toBe(449);
  });
});
