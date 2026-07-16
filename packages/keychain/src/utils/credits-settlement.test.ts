import { describe, expect, it, vi } from "vitest";
import { waitForCreditsBalance } from "./credits-settlement";

describe("waitForCreditsBalance", () => {
  it("polls until the required balance is visible", async () => {
    vi.useFakeTimers();
    const refetchBalance = vi
      .fn<() => Promise<bigint>>()
      .mockResolvedValueOnce(100n)
      .mockResolvedValueOnce(250n);

    const result = waitForCreditsBalance({
      requiredCredits: 250n,
      refetchBalance,
      timeoutMs: 1_000,
      pollIntervalMs: 10,
    });
    await vi.advanceTimersByTimeAsync(10);

    await expect(result).resolves.toBe(250n);
    expect(refetchBalance).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("returns a typed pending error when the balance does not converge", async () => {
    const refetchBalance = vi.fn().mockResolvedValue(100n);

    await expect(
      waitForCreditsBalance({
        requiredCredits: 250n,
        refetchBalance,
        timeoutMs: 0,
      }),
    ).rejects.toMatchObject({
      name: "CreditsBalancePendingError",
      requiredCredits: 250n,
      observedCredits: 100n,
    });
  });
});
