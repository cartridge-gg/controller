import { act, renderHook } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePurchaseLocationGate } from "./usePurchaseLocationGate";

const mocks = vi.hoisted(() => ({
  connection: {
    locationGate: { blocked: ["US-NY"] } as { blocked?: string[] },
    setLocationGateVerified: vi.fn(),
  },
  geo: { isUS: true },
}));

vi.mock("@/hooks/connection", () => ({
  useConnection: () => mocks.connection,
}));

vi.mock("@/hooks/geo", () => ({
  useGeoLocation: () => mocks.geo,
}));

vi.mock("@/components/location/LocationGate", () => ({
  LocationGate: () => null,
}));

describe("usePurchaseLocationGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.connection.locationGate = { blocked: ["US-NY"] };
    mocks.geo.isUS = true;
  });

  it("requires a fresh gate before every configured game purchase", () => {
    const firstPurchase = vi.fn();
    const secondPurchase = vi.fn();
    const { result } = renderHook(() => usePurchaseLocationGate());

    act(() => result.current.runAfterLocationGate(firstPurchase));

    expect(mocks.connection.setLocationGateVerified).toHaveBeenCalledWith(
      false,
    );
    expect(result.current.locationGateView).not.toBeNull();
    expect(firstPurchase).not.toHaveBeenCalled();

    act(() => {
      const gate = result.current.locationGateView as ReactElement<{
        onVerified: () => void;
      }>;
      gate.props.onVerified();
    });
    expect(firstPurchase).toHaveBeenCalledOnce();
    expect(result.current.locationGateView).toBeNull();

    act(() => result.current.runAfterLocationGate(secondPurchase));

    expect(mocks.connection.setLocationGateVerified).toHaveBeenCalledTimes(2);
    expect(result.current.locationGateView).not.toBeNull();
    expect(secondPurchase).not.toHaveBeenCalled();
  });

  it("continues immediately when the game has no location gate", () => {
    mocks.connection.locationGate = {};
    const purchase = vi.fn();
    const { result } = renderHook(() => usePurchaseLocationGate());

    act(() => result.current.runAfterLocationGate(purchase));

    expect(purchase).toHaveBeenCalledOnce();
    expect(mocks.connection.setLocationGateVerified).not.toHaveBeenCalled();
    expect(result.current.locationGateView).toBeNull();
  });
});
