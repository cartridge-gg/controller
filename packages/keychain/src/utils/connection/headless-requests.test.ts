import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";

describe("headless-requests", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves waiters when approval is resolved", async () => {
    vi.resetModules();
    const mod = await import("./headless-requests");

    const request = mod.createHeadlessApprovalRequest();
    const waiter = mod.waitForHeadlessApprovalRequest(request.id);

    mod.resolveHeadlessApprovalRequest(request.id);

    await expect(waiter).resolves.toBeUndefined();
  });

  it("rejects waiters when approval expires", async () => {
    vi.resetModules();
    const mod = await import("./headless-requests");

    const request = mod.createHeadlessApprovalRequest();
    const waiter = mod.waitForHeadlessApprovalRequest(request.id);
    const assertion = expect(waiter).rejects.toThrow(/expired/i);

    // TTL is 5 minutes. Advance past expiry and allow the timeout to run.
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000 + 1);
    await assertion;
  });

  it("getHeadlessApprovalRequest returns undefined after expiry", async () => {
    vi.resetModules();
    const mod = await import("./headless-requests");

    const request = mod.createHeadlessApprovalRequest();
    expect(mod.getHeadlessApprovalRequest(request.id)).toBeTruthy();

    vi.setSystemTime(new Date(request.expiresAt + 1));
    expect(mod.getHeadlessApprovalRequest(request.id)).toBeUndefined();
  });
});
