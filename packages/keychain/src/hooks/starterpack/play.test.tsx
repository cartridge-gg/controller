import { renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { useStarterpackPlayHandler } from "./play";

const mocks = vi.hoisted(() => ({
  closeModal: vi.fn(),
  navigateToRoot: vi.fn(),
  parent: undefined as undefined | { onStarterpackPlay?: () => Promise<void> },
}));

vi.mock("@/hooks/connection", () => ({
  useConnection: () => ({
    closeModal: mocks.closeModal,
    parent: mocks.parent,
  }),
}));

vi.mock("@/context", () => ({
  useNavigation: () => ({
    navigateToRoot: mocks.navigateToRoot,
  }),
}));

describe("useStarterpackPlayHandler", () => {
  beforeEach(() => {
    mocks.closeModal.mockClear();
    mocks.navigateToRoot.mockClear();
    mocks.parent = undefined;
  });

  it("closes the modal when no parent callback exists", () => {
    const { result } = renderHook(() => useStarterpackPlayHandler());

    result.current();

    expect(mocks.closeModal).toHaveBeenCalledTimes(1);
    expect(mocks.navigateToRoot).toHaveBeenCalledTimes(1);
  });

  it("falls back to closing the modal when the callback rejects", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mocks.parent = {
      onStarterpackPlay: vi.fn().mockRejectedValue(new Error("nope")),
    };
    const { result } = renderHook(() => useStarterpackPlayHandler());

    result.current();

    await waitFor(() => {
      expect(mocks.closeModal).toHaveBeenCalledTimes(1);
    });

    consoleError.mockRestore();
  });
});
