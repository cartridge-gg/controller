import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Add any global test setup here

// Mock @dojoengine/torii-wasm to avoid WASM loading issues in tests
vi.mock("@dojoengine/torii-wasm", () => ({
  ToriiClient: vi.fn().mockImplementation(() => ({
    getEntities: vi.fn().mockResolvedValue({ items: [] }),
    getEventMessages: vi.fn().mockResolvedValue({ items: [] }),
    onEntityUpdated: vi.fn().mockResolvedValue({ cancel: vi.fn() }),
    onEventMessageUpdated: vi.fn().mockResolvedValue({ cancel: vi.fn() }),
  })),
}));

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
