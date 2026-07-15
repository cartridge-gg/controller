import { act, renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreditsProvider, useCreditsContext } from "./provider";

vi.mock("./DepositCredits", () => ({ DepositCredits: () => null }));

describe("CreditsProvider", () => {
  beforeEach(() => vi.clearAllMocks());

  const wrapper = ({ children }: PropsWithChildren) => (
    <CreditsProvider>{children}</CreditsProvider>
  );

  it("consumes a deposit success callback exactly once", async () => {
    const onSuccess = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useCreditsContext(), { wrapper });

    act(() => {
      result.current.initiateCreditsDeposit({
        preferredMethod: { type: "coinflow" },
        defaultAmount: 2,
        minimumAmount: 2,
        purchaseKey: "purchase-1",
        onSuccess,
      });
      result.current.onDepositStarted({ type: "coinflow" }, 2);
    });

    await act(async () => {
      const attemptId = result.current.depositRequest!.attemptId;
      await result.current.onDepositFinished(attemptId);
      await result.current.onDepositFinished(attemptId);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.depositInProgress?.status).toBe("success");
  });

  it("surfaces an automatic purchase failure as a deposit error", async () => {
    const { result } = renderHook(() => useCreditsContext(), { wrapper });

    act(() => {
      result.current.initiateCreditsDeposit({
        onSuccess: async () => {
          throw new Error("Credits did not settle");
        },
      });
      result.current.onDepositStarted({ type: "coinflow" }, 2);
    });

    await act(async () => {
      await result.current.onDepositFinished(
        result.current.depositRequest!.attemptId,
      );
    });

    expect(result.current.depositInProgress).toMatchObject({
      status: "error",
      error: "Credits did not settle",
    });
  });

  it("does not let an older settlement consume a newer attempt", async () => {
    const firstSuccess = vi.fn().mockResolvedValue(undefined);
    const secondSuccess = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useCreditsContext(), { wrapper });

    act(() => {
      result.current.initiateCreditsDeposit({ onSuccess: firstSuccess });
    });
    const firstAttemptId = result.current.depositRequest!.attemptId;
    const finishFirstAttempt = result.current.onDepositFinished;

    act(() => {
      result.current.initiateCreditsDeposit({ onSuccess: secondSuccess });
    });
    const secondAttemptId = result.current.depositRequest!.attemptId;

    await act(async () => {
      await finishFirstAttempt(firstAttemptId);
    });
    expect(firstSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.depositRequest).toMatchObject({
      attemptId: secondAttemptId,
      onSuccess: secondSuccess,
    });

    await act(async () => {
      await result.current.onDepositFinished(secondAttemptId);
    });
    expect(secondSuccess).toHaveBeenCalledTimes(1);
  });
});
