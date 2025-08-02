import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Add unknown global test setup here

// Suppress ReactDOMTestUtils.act deprecation warnings from testing library internals
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args: unknown[]) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes("ReactDOMTestUtils.act is deprecated") ||
      args[0].includes("`ReactDOMTestUtils.act` is deprecated"))
  ) {
    return; // Suppress this specific warning
  }
  originalWarn.apply(console, args);
};

console.error = (...args: unknown[]) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes("ReactDOMTestUtils.act is deprecated") ||
      args[0].includes("`ReactDOMTestUtils.act` is deprecated"))
  ) {
    return; // Suppress this specific warning
  }
  originalError.apply(console, args);
};

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false, // Default to mobile view
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

afterEach(() => {
  cleanup();
});
