import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { act } from "react";
import {
  BETA_CONTROLLER,
  CONTROLLER_VERSIONS,
  ControllerVersionInfo,
  OutsideExecutionVersion,
  STABLE_CONTROLLER,
  UpgradeProvider,
  determineUpgradePath,
  useUpgrade,
} from "./upgrade";
import { ReactNode } from "react";
import { PostHogContext, PostHogWrapper } from "@cartridge/ui/utils";
import Controller from "@/utils/controller";

// Mock the usePostHog hook
vi.mock("./posthog", () => ({
  usePostHog: () => ({
    onFeatureFlag: vi.fn((key, callback) => {
      if (key === "controller-beta") {
        callback(false);
      }
    }),
  }),
}));

describe("determineUpgradePath", () => {
  it("should return available=false when currentVersion is undefined", () => {
    const result = determineUpgradePath(undefined, false);
    expect(result.available).toBe(false);
    expect(result.targetVersion).toBe(STABLE_CONTROLLER);
  });

  it("should return available=false when current version is the same as target version (stable)", () => {
    const currentVersion = STABLE_CONTROLLER;
    const result = determineUpgradePath(currentVersion, false);
    expect(result.available).toBe(false);
    expect(result.targetVersion).toBe(STABLE_CONTROLLER);
  });

  it("should return available=false when current version is the same as target version (beta)", () => {
    const currentVersion = BETA_CONTROLLER;
    const result = determineUpgradePath(currentVersion, true);
    expect(result.available).toBe(false);
    expect(result.targetVersion).toBe(BETA_CONTROLLER);
  });

  it("should return available=true when current version is older than target version (stable)", () => {
    const currentVersion = CONTROLLER_VERSIONS[3]; // Older version
    const result = determineUpgradePath(currentVersion, false);
    expect(result.available).toBe(true);
    expect(result.targetVersion).toBe(STABLE_CONTROLLER);
  });

  it("should return available=true when current version is older than target version (beta)", () => {
    const currentVersion = CONTROLLER_VERSIONS[4];
    const result = determineUpgradePath(currentVersion, true);
    expect(result.available).toBe(true);
    expect(result.targetVersion).toBe(BETA_CONTROLLER);
  });

  it("should return available=false when current version is newer than target version (downgrade not allowed)", () => {
    // Create a hypothetical newer version
    const newerVersion: ControllerVersionInfo = {
      version: "1.0.10",
      hash: "0x999999999999999999999999999999999999999999999999999999999999999",
      outsideExecutionVersion: OutsideExecutionVersion.V3,
      changes: ["Test version"],
    };

    // This test simulates a situation where the user has a newer version than what's in our target list
    // We're testing that we don't allow downgrades
    const result = determineUpgradePath(newerVersion, true);
    expect(result.available).toBe(false);
    expect(result.targetVersion).toBe(BETA_CONTROLLER);
  });
});

describe("UpgradeProvider", () => {
  const mockController = {
    address: vi.fn().mockReturnValue("0xmockAddress"),
    classHash: vi.fn().mockReturnValue(CONTROLLER_VERSIONS[3].hash),
    provider: {
      getClassHashAt: vi.fn(),
      waitForTransaction: vi.fn().mockResolvedValue({}),
    },
    upgrade: vi.fn().mockResolvedValue({
      contractAddress: "0xmockAddress",
      entrypoint: "upgrade",
      calldata: [],
    }),
    executeFromOutsideV2: vi
      .fn()
      .mockResolvedValue({ transaction_hash: "0xmockTxHash" }),
    executeFromOutsideV3: vi
      .fn()
      .mockResolvedValue({ transaction_hash: "0xmockTxHash" }),
  };

  const mockPosthogInstance = {
    onFeatureFlag: vi.fn((key, callback) => {
      if (key === "controller-beta") {
        // Immediately call the callback to set the feature flag
        callback(false);
      }
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockController.provider.getClassHashAt.mockReset();
    mockPosthogInstance.onFeatureFlag.mockClear();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <PostHogContext.Provider
      value={{ posthog: mockPosthogInstance as unknown as PostHogWrapper }}
    >
      <UpgradeProvider controller={mockController as unknown as Controller}>
        {children}
      </UpgradeProvider>
    </PostHogContext.Provider>
  );

  it("should initialize with correct default values", async () => {
    // Setup the mock to resolve immediately
    mockController.provider.getClassHashAt.mockResolvedValueOnce(
      CONTROLLER_VERSIONS[3].hash,
    );

    const { result } = renderHook(() => useUpgrade(), { wrapper });

    // Wait for the component to update
    await act(async () => {
      // Wait for all promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Wait for the component to update
    await act(async () => {
      // Manually trigger the state updates that would happen after API calls
      await vi.waitFor(
        () => {
          return result.current.isSynced === true;
        },
        { timeout: 5000 },
      );
    });

    expect(result.current.available).toBe(true);
    expect(result.current.current).toBe(CONTROLLER_VERSIONS[3]);
    expect(result.current.latest).toBe(STABLE_CONTROLLER);
    expect(result.current.isUpgrading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.isBeta).toBe(false);
  });

  it("should handle contract not found error", async () => {
    mockController.provider.getClassHashAt.mockRejectedValueOnce(
      new Error("Contract not found"),
    );

    const { result } = renderHook(() => useUpgrade(), { wrapper });

    // Wait for the component to update
    await act(async () => {
      // Wait for all promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Wait for the component to update
    await act(async () => {
      // Manually trigger the state updates that would happen after API calls
      await vi.waitFor(
        () => {
          return result.current.isSynced === true;
        },
        { timeout: 5000 },
      );
    });

    expect(result.current.available).toBe(true);
    expect(result.current.current).toBe(CONTROLLER_VERSIONS[3]);
    expect(result.current.latest).toBe(STABLE_CONTROLLER);
  });

  it("should handle other errors", async () => {
    const testError = new Error("Test error");
    mockController.provider.getClassHashAt.mockRejectedValueOnce(testError);

    const { result } = renderHook(() => useUpgrade(), { wrapper });

    // Wait for the component to update
    await act(async () => {
      // Wait for all promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Wait for the component to update
    await act(async () => {
      // Manually trigger the state updates that would happen after API calls
      await vi.waitFor(
        () => {
          return result.current.isSynced === true;
        },
        { timeout: 5000 },
      );
    });

    expect(result.current.error).toBe(testError);
  });

  it("should handle upgrade with V2 execution", async () => {
    mockController.provider.getClassHashAt.mockResolvedValueOnce(
      CONTROLLER_VERSIONS[1].hash,
    );

    const { result } = renderHook(() => useUpgrade(), { wrapper });

    // Wait for the component to update
    await act(async () => {
      // Wait for all promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Wait for the component to update
    await act(async () => {
      // Manually trigger the state updates that would happen after API calls
      await vi.waitFor(
        () => {
          return result.current.isSynced === true;
        },
        { timeout: 5000 },
      );
    });

    expect(result.current.current?.outsideExecutionVersion).toBe(
      OutsideExecutionVersion.V2,
    );

    // Trigger upgrade
    await act(async () => {
      await result.current.onUpgrade();
    });

    expect(mockController.executeFromOutsideV2).toHaveBeenCalled();
    expect(mockController.executeFromOutsideV3).not.toHaveBeenCalled();
    expect(mockController.provider.waitForTransaction).toHaveBeenCalledWith(
      "0xmockTxHash",
      {
        retryInterval: 1000,
      },
    );
  });

  it("should handle upgrade with V3 execution", async () => {
    mockController.provider.getClassHashAt.mockResolvedValueOnce(
      CONTROLLER_VERSIONS[2].hash,
    );

    const { result } = renderHook(() => useUpgrade(), { wrapper });

    // Wait for the component to update
    await act(async () => {
      // Wait for all promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Wait for the component to update
    await act(async () => {
      // Manually trigger the state updates that would happen after API calls
      await vi.waitFor(
        () => {
          return result.current.isSynced === true;
        },
        { timeout: 5000 },
      );
    });

    expect(result.current.current?.outsideExecutionVersion).toBe(
      OutsideExecutionVersion.V3,
    );

    // Trigger upgrade
    await act(async () => {
      await result.current.onUpgrade();
    });

    expect(mockController.executeFromOutsideV2).not.toHaveBeenCalled();
    expect(mockController.executeFromOutsideV3).toHaveBeenCalled();
    expect(mockController.provider.waitForTransaction).toHaveBeenCalledWith(
      "0xmockTxHash",
      {
        retryInterval: 1000,
      },
    );
  });

  it("should handle upgrade errors", async () => {
    mockController.provider.getClassHashAt.mockResolvedValueOnce(
      CONTROLLER_VERSIONS[2].hash,
    );
    const testError = new Error("Upgrade failed");
    mockController.executeFromOutsideV3.mockRejectedValueOnce(testError);

    const { result } = renderHook(() => useUpgrade(), { wrapper });

    // Wait for the component to update
    await act(async () => {
      // Wait for all promises to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Wait for the component to update
    await act(async () => {
      // Manually trigger the state updates that would happen after API calls
      await vi.waitFor(
        () => {
          return result.current.isSynced === true;
        },
        { timeout: 5000 },
      );
    });

    // Trigger upgrade
    await act(async () => {
      await result.current.onUpgrade();
    });

    expect(result.current.error).toBe(testError);
  });
});
