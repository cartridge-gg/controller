import { renderHook, waitFor } from "@testing-library/react";
import React, { PropsWithChildren, act } from "react";
import { vi, beforeEach } from "vitest";
import {
  FeatureProvider,
  useAdvancedView,
  useFeatures,
  useFeature,
  Feature,
} from "./features";

const LOCAL_STORAGE_KEY = "@cartridge/features";

// Use React.FC type alias for the wrapper component
const wrapper: React.FC<PropsWithChildren> = ({ children }) => {
  return <FeatureProvider>{children}</FeatureProvider>;
};

describe("Feature Flags Hooks and Provider", () => {
  // Clear local storage before each test
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("should initialize with features from local storage", () => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ testFeature: true }),
    );
    const { result } = renderHook(() => useFeatures(), { wrapper });
    expect(result.current.features).toEqual({ testFeature: true });
  });

  it("should initialize with an empty object if local storage is empty", () => {
    const { result } = renderHook(() => useFeatures(), { wrapper });
    expect(result.current.features).toEqual({});
  });

  it("should enable a feature", () => {
    const { result } = renderHook(() => useFeatures(), { wrapper });

    act(() => {
      result.current.enableFeature("newFeature" as Feature);
    });

    expect(result.current.features).toEqual({ newFeature: true });
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBe(
      JSON.stringify({ newFeature: true }),
    );
  });

  it("should disable a feature", () => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ existingFeature: true }),
    );
    const { result } = renderHook(() => useFeatures(), { wrapper });

    act(() => {
      result.current.disableFeature("existingFeature" as Feature);
    });

    expect(result.current.features).toEqual({ existingFeature: false });
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBe(
      JSON.stringify({ existingFeature: false }),
    );
  });

  it("should correctly report if a feature is enabled using useFeature", () => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ enabledFeat: true, disabledFeat: false }),
    );

    const { result: enabledResult } = renderHook(
      () => useFeature("enabledFeat" as Feature),
      { wrapper },
    );
    const { result: disabledResult } = renderHook(
      () => useFeature("disabledFeat" as Feature),
      { wrapper },
    );
    const { result: nonExistentResult } = renderHook(
      () => useFeature("nonExistent" as Feature),
      { wrapper },
    );

    expect(enabledResult.current).toBe(true);
    expect(disabledResult.current).toBe(false);
    expect(nonExistentResult.current).toBe(false); // Non-existent features are implicitly disabled
  });

  it("should update useFeature hook when feature state changes", async () => {
    // Render both hooks together in a single renderHook call
    const { result } = renderHook(
      () => {
        const featuresHook = useFeatures(); // Get controls
        const featureValue = useFeature("dynamicFeature" as Feature); // Get specific value
        return { featuresHook, featureValue }; // Return both
      },
      { wrapper },
    );

    // Initial state check
    expect(result.current.featureValue).toBe(false);

    // Enable the feature using the controls from the same render context
    act(() => {
      result.current.featuresHook.enableFeature("dynamicFeature" as Feature);
    });

    // Wait for the update to be reflected in featureValue from the same render
    await waitFor(() => {
      expect(result.current.featureValue).toBe(true);
    });

    // Disable the feature
    act(() => {
      result.current.featuresHook.disableFeature("dynamicFeature" as Feature);
    });

    // Wait for the update
    await waitFor(() => {
      expect(result.current.featureValue).toBe(false);
    });
  });

  it("should handle errors when parsing invalid JSON from local storage", () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, "invalid json");
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {}); // Suppress console error during test

    const { result } = renderHook(() => useFeatures(), { wrapper });
    expect(result.current.features).toEqual({}); // Should default to empty object

    consoleErrorSpy.mockRestore(); // Restore console.error
  });

  it.each([
    ["null", {}],
    [JSON.stringify([true, false]), {}],
    [JSON.stringify("advanced-view"), {}],
    [
      JSON.stringify({
        "advanced-view": true,
        invalid: "true",
        ignored: null,
        existing: false,
      }),
      { "advanced-view": true, existing: false },
    ],
  ])("normalizes stored feature data %s", (storedValue, expected) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, storedValue);

    const { result } = renderHook(() => useFeatures(), { wrapper });

    expect(result.current.features).toEqual(expected);
  });

  it("defaults advanced view to disabled and updates immediately", () => {
    const { result } = renderHook(
      () => ({ advancedView: useAdvancedView(), features: useFeatures() }),
      { wrapper },
    );

    expect(result.current.advancedView).toBe(false);

    act(() => result.current.features.enableFeature("advanced-view"));

    expect(result.current.advancedView).toBe(true);
  });

  it("persists advanced view while preserving unrelated flags", () => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ "coinflow-support": true }),
    );
    const { result, unmount } = renderHook(() => useFeatures(), { wrapper });

    act(() => result.current.enableFeature("advanced-view"));

    expect(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? "{}")).toEqual(
      {
        "coinflow-support": true,
        "advanced-view": true,
      },
    );

    unmount();
    const remounted = renderHook(() => useAdvancedView(), { wrapper });
    expect(remounted.result.current).toBe(true);
  });

  it("keeps in-memory state usable when storage is unavailable", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Storage is unavailable", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage is unavailable", "SecurityError");
    });

    const { result } = renderHook(
      () => ({ advancedView: useAdvancedView(), features: useFeatures() }),
      { wrapper },
    );

    act(() => result.current.features.enableFeature("advanced-view"));

    expect(result.current.advancedView).toBe(true);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("keeps in-memory changes when a storage write fails", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      });
    const { result } = renderHook(
      () => ({ advancedView: useAdvancedView(), features: useFeatures() }),
      { wrapper },
    );

    act(() => result.current.features.enableFeature("advanced-view"));

    expect(result.current.advancedView).toBe(true);
    expect(setItemSpy).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("ignores unrelated storage events", () => {
    const { result } = renderHook(() => useFeatures(), { wrapper });

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "unrelated",
          newValue: JSON.stringify({ "advanced-view": true }),
        }),
      );
    });

    expect(result.current.features).toEqual({});
  });

  it("synchronizes key-filtered storage events with last-write-wins", () => {
    const { result } = renderHook(() => useAdvancedView(), { wrapper });

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: LOCAL_STORAGE_KEY,
          newValue: JSON.stringify({ "advanced-view": true }),
        }),
      );
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: LOCAL_STORAGE_KEY,
          newValue: JSON.stringify({ "advanced-view": false }),
        }),
      );
    });

    expect(result.current).toBe(false);
  });

  it("removes the exact storage event listener on unmount", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useFeatures(), { wrapper });
    const storageListener = addEventListenerSpy.mock.calls.find(
      ([eventName]) => eventName === "storage",
    )?.[1];

    expect(storageListener).toBeDefined();
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "storage",
      storageListener,
      false,
    );
  });
});
