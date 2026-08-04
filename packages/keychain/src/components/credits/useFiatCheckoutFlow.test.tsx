import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFiatCheckoutFlow } from "./useFiatCheckoutFlow";

const mocks = vi.hoisted(() => ({
  identity: {
    isEmailVerified: false,
    isPhoneNumberVerified: false,
    initiateEmailVerification: vi.fn(),
    initiatePhoneNumberVerification: vi.fn(),
    isVerifying: false,
    isCanceled: false,
  },
}));

vi.mock("@/components/identity/provider", () => ({
  useIdentityContext: () => mocks.identity,
}));

describe("useFiatCheckoutFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.identity.isEmailVerified = false;
    mocks.identity.isPhoneNumberVerified = false;
    mocks.identity.isVerifying = false;
    mocks.identity.isCanceled = false;
  });

  it("does not require email verification for Coinflow card purchases", () => {
    const { result } = renderHook(() =>
      useFiatCheckoutFlow({ method: "coinflow" }),
    );

    act(() => result.current.handleContinue());

    expect(result.current.phase).toBe("pay");
    expect(result.current.verifying).toBe(false);
    expect(mocks.identity.initiateEmailVerification).not.toHaveBeenCalled();
  });

  it("keeps email and phone verification for Apple Pay", () => {
    const { result } = renderHook(() =>
      useFiatCheckoutFlow({ method: "apple-pay" }),
    );

    act(() => result.current.handleContinue());

    expect(result.current.verifying).toBe(true);
    expect(mocks.identity.initiateEmailVerification).toHaveBeenCalledOnce();
  });
});
