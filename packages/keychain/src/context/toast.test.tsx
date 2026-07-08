import { renderHook, act } from "@testing-library/react";
import React, { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CONTROLLER_TOAST_MESSAGE_TYPE } from "@cartridge/controller-ui";
import { isIframe } from "@cartridge/controller-ui/utils";
import { toast as sonnerToast } from "sonner";
import { useConnection } from "@/hooks/connection";
import { ToastProvider, useToast } from "./toast";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@cartridge/controller-ui/utils", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@cartridge/controller-ui/utils")>();
  return {
    ...actual,
    isIframe: vi.fn(() => true),
  };
});

vi.mock("@/hooks/connection", () => ({
  useConnection: vi.fn(),
}));

const PRESET = "my-preset";

// Controls what the mocked useConnection returns; individual tests mutate this.
let connectionValue: Record<string, unknown>;

function setConnection(overrides: Record<string, unknown> = {}) {
  connectionValue = {
    preset: PRESET,
    controller: undefined,
    configuredChains: [],
    ...overrides,
  };
  vi.mocked(useConnection).mockReturnValue(
    connectionValue as ReturnType<typeof useConnection>,
  );
}

const wrapper: React.FC<PropsWithChildren> = ({ children }) => (
  <ToastProvider>{children}</ToastProvider>
);

function renderToast() {
  return renderHook(() => useToast(), { wrapper });
}

describe("ToastProvider", () => {
  let postMessageSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    setConnection();
    vi.mocked(isIframe).mockReturnValue(true);
    postMessageSpy = vi
      .spyOn(window.parent, "postMessage")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    postMessageSpy.mockRestore();
  });

  it("throws when useToast is used outside a provider", () => {
    // Silence the expected React error-boundary console output.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useToast())).toThrow(
      "useToast must be used within a ToastProvider",
    );
    spy.mockRestore();
  });

  describe("error", () => {
    it("shows a sonner error and posts an error toast with the preset", () => {
      const { result } = renderToast();
      postMessageSpy.mockClear();

      act(() => {
        result.current.toast.error("boom", { message: "boom", duration: 5 });
      });

      expect(sonnerToast.error).toHaveBeenCalledWith("boom");
      expect(postMessageSpy).toHaveBeenCalledWith(
        {
          type: CONTROLLER_TOAST_MESSAGE_TYPE,
          options: {
            variant: "error",
            message: "boom",
            duration: 5,
            preset: PRESET,
          },
        },
        "*",
      );
    });

    it("does not call sonner when the message is empty but still emits", () => {
      const { result } = renderToast();
      postMessageSpy.mockClear();

      act(() => {
        result.current.toast.error("");
      });

      expect(sonnerToast.error).not.toHaveBeenCalled();
      expect(postMessageSpy).toHaveBeenCalledTimes(1);
    });

    it("does nothing when disabled", () => {
      const { result } = renderToast();
      postMessageSpy.mockClear();

      act(() => {
        result.current.toast.error("boom", undefined, true);
      });

      expect(sonnerToast.error).not.toHaveBeenCalled();
      expect(postMessageSpy).not.toHaveBeenCalled();
    });
  });

  describe("success", () => {
    it("shows a sonner success and posts a success toast", () => {
      const { result } = renderToast();
      postMessageSpy.mockClear();

      act(() => {
        result.current.toast.success("nice");
      });

      expect(sonnerToast.success).toHaveBeenCalledWith("nice");
      expect(postMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: CONTROLLER_TOAST_MESSAGE_TYPE,
          options: expect.objectContaining({
            variant: "success",
            message: "nice",
            preset: PRESET,
          }),
        }),
        "*",
      );
    });

    it("does nothing when disabled", () => {
      const { result } = renderToast();
      postMessageSpy.mockClear();

      act(() => {
        result.current.toast.success("nice", undefined, true);
      });

      expect(postMessageSpy).not.toHaveBeenCalled();
    });
  });

  describe("transaction", () => {
    it("marks safeToClose only when confirmed", () => {
      const { result } = renderToast();

      postMessageSpy.mockClear();
      act(() => {
        result.current.toast.transaction("done", { status: "confirmed" });
      });
      expect(postMessageSpy.mock.calls[0][0]).toMatchObject({
        options: { variant: "transaction", safeToClose: true },
      });

      postMessageSpy.mockClear();
      act(() => {
        result.current.toast.transaction("pending", { status: "confirming" });
      });
      expect(postMessageSpy.mock.calls[0][0]).toMatchObject({
        options: { variant: "transaction", safeToClose: false },
      });
    });

    it("does nothing when disabled", () => {
      const { result } = renderToast();
      postMessageSpy.mockClear();

      act(() => {
        result.current.toast.transaction("done", { status: "confirmed" }, true);
      });

      expect(postMessageSpy).not.toHaveBeenCalled();
    });
  });

  describe("marketplace", () => {
    it("emits with safeToClose and shows a sonner success", () => {
      const { result } = renderToast();
      postMessageSpy.mockClear();

      act(() => {
        result.current.toast.marketplace("bought", {
          itemNames: ["Sword"],
          itemImages: ["sword.png"],
          collectionName: "Weapons",
          action: "purchased",
        });
      });

      expect(sonnerToast.success).toHaveBeenCalledWith("bought");
      expect(postMessageSpy.mock.calls[0][0]).toMatchObject({
        options: { variant: "marketplace", safeToClose: true },
      });
    });
  });

  describe("achievement", () => {
    it("emits an achievement toast", () => {
      const { result } = renderToast();
      postMessageSpy.mockClear();

      act(() => {
        result.current.toast.achievement("unlocked", {
          title: "First Win",
          xpAmount: 10,
          progress: 100,
        });
      });

      expect(sonnerToast.success).toHaveBeenCalledWith("unlocked");
      expect(postMessageSpy.mock.calls[0][0]).toMatchObject({
        options: { variant: "achievement", title: "First Win" },
      });
    });
  });

  describe("quest", () => {
    it("shows a sonner success from the subtitle and emits", () => {
      const { result } = renderToast();
      postMessageSpy.mockClear();

      act(() => {
        result.current.toast.quest({ title: "Quest", subtitle: "Do it" });
      });

      expect(sonnerToast.success).toHaveBeenCalledWith("Do it");
      expect(postMessageSpy.mock.calls[0][0]).toMatchObject({
        options: { variant: "quest", title: "Quest" },
      });
    });
  });

  describe("network / user / setting", () => {
    it("emits a network toast", () => {
      const { result } = renderToast();
      postMessageSpy.mockClear();

      act(() => {
        result.current.toast.network({ kind: "switch-chain", chainId: "0x1" });
      });

      expect(postMessageSpy.mock.calls[0][0]).toMatchObject({
        options: { variant: "network", kind: "switch-chain", preset: PRESET },
      });
    });

    it("emits a user toast", () => {
      const { result } = renderToast();
      postMessageSpy.mockClear();

      act(() => {
        result.current.toast.user({ username: "alice", kind: "connected" });
      });

      expect(postMessageSpy.mock.calls[0][0]).toMatchObject({
        options: { variant: "user", username: "alice" },
      });
    });

    it("emits a setting toast", () => {
      const { result } = renderToast();
      postMessageSpy.mockClear();

      act(() => {
        result.current.toast.setting({ kind: "signer", action: "created" });
      });

      expect(postMessageSpy.mock.calls[0][0]).toMatchObject({
        options: { variant: "setting", action: "created" },
      });
    });
  });

  it("does not post a message when not running in an iframe", () => {
    vi.mocked(isIframe).mockReturnValue(false);
    const { result } = renderToast();
    postMessageSpy.mockClear();

    act(() => {
      result.current.toast.error("boom");
    });

    expect(sonnerToast.error).toHaveBeenCalledWith("boom");
    expect(postMessageSpy).not.toHaveBeenCalled();
  });
});

describe("ChainSwitchDetector", () => {
  let postMessageSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isIframe).mockReturnValue(true);
    postMessageSpy = vi
      .spyOn(window.parent, "postMessage")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    postMessageSpy.mockRestore();
  });

  it("suppresses the initial connect toast but emits on chain switch", () => {
    const chains = [
      { chainId: "0x1", name: "Mainnet", icon: "main.png" },
      { chainId: "0x2", name: "Testnet", icon: "test.png" },
    ];

    setConnection({
      controller: { chainId: () => "0x1" },
      configuredChains: chains,
    });

    const { rerender } = renderHook(() => useToast(), { wrapper });

    // Initial render is a "connect" (disabled), so nothing is emitted.
    const networkCalls = () =>
      postMessageSpy.mock.calls.filter(
        (call) =>
          (call[0] as { options?: { variant?: string } })?.options?.variant ===
          "network",
      );
    expect(networkCalls()).toHaveLength(0);

    // Switching to a new chain must emit a "switch-chain" network toast.
    setConnection({
      controller: { chainId: () => "0x2" },
      configuredChains: chains,
    });
    act(() => {
      rerender();
    });

    const emitted = networkCalls();
    expect(emitted.length).toBeGreaterThanOrEqual(1);
    expect(
      (emitted[0][0] as { options: Record<string, unknown> }).options,
    ).toMatchObject({
      variant: "network",
      kind: "switch-chain",
      chainId: "0x2",
      networkName: "Testnet",
      networkIcon: "test.png",
    });
  });
});
