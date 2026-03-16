import { describe, expect, it } from "vitest";
import { TRANSFER_HISTORY_LIMIT, shouldFetchProfileHistory } from "./data";

describe("profile history query config", () => {
  it("uses a bounded transfer history limit", () => {
    expect(TRANSFER_HISTORY_LIMIT).toBe(100);
  });

  it("fetches profile history only on account routes", () => {
    expect(shouldFetchProfileHistory("/account/spag/inventory")).toBe(true);
    expect(
      shouldFetchProfileHistory("/account/spag/slot/summit/activity"),
    ).toBe(true);
    expect(shouldFetchProfileHistory("/execute")).toBe(false);
    expect(shouldFetchProfileHistory("/settings")).toBe(false);
    expect(shouldFetchProfileHistory("/")).toBe(false);
  });
});
