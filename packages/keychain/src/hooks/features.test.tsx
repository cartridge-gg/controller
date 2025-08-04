import { renderHook, waitFor } from "@testing-library/react";
import React, { PropsWithChildren, act } from "react";
import { vi, beforeEach } from "vitest";
import { FeatureProvider, useFeatures, useFeature, Feature } from "./features"; // Adjust path as needed

const LOCAL_STORAGE_KEY = "@cartridge/features";

// Use React.FC type alias for the wrapper component
const wrapper: React.FC<PropsWithChildren> = ({ children }) => {
  return <FeatureProvider>{children}</FeatureProvider>;
};

describe("Feature Flags Hooks and Provider", () => {
  // Clear local storage before each test
  beforeEach(() => {
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
      result.current.enableFeature("newFeature");
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
      result.current.disableFeature("existingFeature");
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
      result.current.featuresHook.enableFeature("dynamicFeature");
    });

    // Wait for the update to be reflected in featureValue from the same render
    await waitFor(() => {
      expect(result.current.featureValue).toBe(true);
    });

    // Disable the feature
    act(() => {
      result.current.featuresHook.disableFeature("dynamicFeature");
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
});
