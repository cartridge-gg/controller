import { renderHook, waitFor } from "@testing-library/react";
import { PropsWithChildren } from "react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { NavigationProvider } from "@/context/navigation";
import {
  ConnectionContext,
  ConnectionContextValue,
} from "@/components/provider/connection";
import { createMockConnection } from "@/test/mocks/connection";
import { useStarterpackPlayHandler } from "./play";

function renderPlayHook(
  overrides?: Partial<ConnectionContextValue>,
) {
  const connection = createMockConnection(overrides);
  const wrapper = ({ children }: PropsWithChildren) => (
    <MemoryRouter>
      <NavigationProvider>
        <ConnectionContext.Provider value={connection}>
          {children}
        </ConnectionContext.Provider>
      </NavigationProvider>
    </MemoryRouter>
  );

  return renderHook(() => useStarterpackPlayHandler(), { wrapper });
}

describe("useStarterpackPlayHandler", () => {
  it("closes the modal when no parent callback exists", () => {
    const closeModal = vi.fn();
    const { result } = renderPlayHook({ closeModal, parent: undefined });

    result.current();

    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  it("falls back to closing the modal when the callback rejects", async () => {
    const closeModal = vi.fn();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const parent = {
      onStarterpackPlay: vi.fn().mockRejectedValue(new Error("nope")),
    };
    const { result } = renderPlayHook({
      closeModal,
      parent: parent as ConnectionContextValue["parent"],
    });

    result.current();

    await waitFor(() => {
      expect(closeModal).toHaveBeenCalledTimes(1);
    });

    consoleError.mockRestore();
  });
});
