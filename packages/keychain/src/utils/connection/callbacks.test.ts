import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  storeCallbacks,
  getCallbacks,
  cleanupCallbacks,
  generateCallbackId,
} from "./callbacks";

describe("callbacks", () => {
  beforeEach(() => {
    // Clean up any existing callbacks between tests
    const testIds = ["1", "2", "3", "test-id"];
    testIds.forEach((id) => cleanupCallbacks(id));
  });

  describe("generateCallbackId", () => {
    it("should generate non-empty string IDs", () => {
      const id = generateCallbackId();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });

    it("should generate unique IDs", () => {
      const ids = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        ids.add(generateCallbackId());
      }
      // Every generated id must be distinct.
      expect(ids.size).toBe(1000);
    });

    // Regression guard for the connect bug: callback ids are stored in the
    // keychain `window`, which reloads on disconnect/logout. A plain counter
    // reset back to "1" on reload, so a subsequent connect reused an old id,
    // navigated to the same `/connect?id=1` URL, and the stale callback state
    // left the parent's `keychain.connect()` unresolved. Ids must stay unique
    // even when the counter base is wiped (i.e. across an iframe reload).
    it("should not reuse IDs after the id counter is reset (iframe reload)", () => {
      const before = generateCallbackId();

      // Simulate the iframe reload clearing the counter on `window`.
      delete (
        window as typeof window & {
          __cartridge_controller_callback_counter?: number;
        }
      ).__cartridge_controller_callback_counter;

      const after = generateCallbackId();
      expect(after).not.toBe(before);
    });

    // Same guarantee on the fallback path used when crypto.randomUUID is
    // unavailable: the counter+random suffix must stay unique even when the
    // counter base resets (as it does on iframe reload).
    it("stays unique on the fallback path when crypto.randomUUID is unavailable", () => {
      vi.stubGlobal("crypto", {});
      try {
        const before = generateCallbackId();

        // Simulate the iframe reload clearing the counter on `window`.
        delete (
          window as typeof window & {
            __cartridge_controller_callback_counter?: number;
          }
        ).__cartridge_controller_callback_counter;

        const after = generateCallbackId();
        // Confirms the fallback branch ran (counter+suffix, not a UUID).
        expect(before).toMatch(/^\d+-[a-z0-9]+$/);
        expect(after).not.toBe(before);

        const ids = new Set<string>([before, after]);
        for (let i = 0; i < 100; i++) {
          ids.add(generateCallbackId());
        }
        expect(ids.size).toBe(102);
      } finally {
        vi.unstubAllGlobals();
      }
    });
  });

  describe("storeCallbacks", () => {
    it("should store callbacks with given ID", () => {
      const mockResolve = () => {};
      const mockReject = () => {};
      const mockOnCancel = () => {};

      const callbacks = {
        resolve: mockResolve,
        reject: mockReject,
        onCancel: mockOnCancel,
      };

      storeCallbacks("test-id", callbacks);

      const retrieved = getCallbacks("test-id");
      expect(retrieved).toEqual(callbacks);
    });

    it("should overwrite existing callbacks with same ID", () => {
      const callbacks1 = {
        resolve: () => "first",
      };

      const callbacks2 = {
        resolve: () => "second",
        reject: () => "error",
      };

      storeCallbacks("test-id", callbacks1);
      storeCallbacks("test-id", callbacks2);

      const retrieved = getCallbacks("test-id");
      expect(retrieved).toEqual(callbacks2);
    });

    it("should store different callbacks for different IDs", () => {
      const callbacks1 = { resolve: () => "first" };
      const callbacks2 = { resolve: () => "second" };

      storeCallbacks("id1", callbacks1);
      storeCallbacks("id2", callbacks2);

      expect(getCallbacks("id1")).toEqual(callbacks1);
      expect(getCallbacks("id2")).toEqual(callbacks2);
    });
  });

  describe("getCallbacks", () => {
    it("should return stored callbacks", () => {
      const callbacks = {
        resolve: () => "test",
        reject: () => "error",
      };

      storeCallbacks("test-id", callbacks);
      const retrieved = getCallbacks("test-id");

      expect(retrieved).toEqual(callbacks);
    });

    it("should return undefined for non-existent ID", () => {
      const retrieved = getCallbacks("non-existent-id");
      expect(retrieved).toBeUndefined();
    });

    it("should return undefined after cleanup", () => {
      const callbacks = { resolve: () => "test" };

      storeCallbacks("test-id", callbacks);
      cleanupCallbacks("test-id");
      const retrieved = getCallbacks("test-id");

      expect(retrieved).toBeUndefined();
    });
  });

  describe("cleanupCallbacks", () => {
    it("should remove callbacks for given ID", () => {
      const callbacks = { resolve: () => "test" };

      storeCallbacks("test-id", callbacks);
      expect(getCallbacks("test-id")).toEqual(callbacks);

      cleanupCallbacks("test-id");
      expect(getCallbacks("test-id")).toBeUndefined();
    });

    it("should only remove callbacks for specified ID", () => {
      const callbacks1 = { resolve: () => "first" };
      const callbacks2 = { resolve: () => "second" };

      storeCallbacks("id1", callbacks1);
      storeCallbacks("id2", callbacks2);

      cleanupCallbacks("id1");

      expect(getCallbacks("id1")).toBeUndefined();
      expect(getCallbacks("id2")).toEqual(callbacks2);
    });

    it("should handle cleanup of non-existent ID gracefully", () => {
      expect(() => cleanupCallbacks("non-existent-id")).not.toThrow();
    });
  });

  describe("integration", () => {
    it("should handle complete callback lifecycle", () => {
      // Generate ID
      const id = generateCallbackId();
      expect(typeof id).toBe("string");

      // Store callbacks
      const callbacks = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolve: (result: any) => result,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        reject: (error: any) => error,
        onCancel: () => "canceled",
      };

      storeCallbacks(id, callbacks);

      // Retrieve callbacks
      const retrieved = getCallbacks(id);
      expect(retrieved).toEqual(callbacks);

      // Cleanup
      cleanupCallbacks(id);
      expect(getCallbacks(id)).toBeUndefined();
    });

    it("should handle multiple concurrent callbacks", () => {
      const ids: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const callbacksArray: any[] = [];

      // Store multiple callbacks
      for (let i = 0; i < 5; i++) {
        const id = generateCallbackId();
        const callbacks = {
          resolve: () => `result-${i}`,
          reject: () => `error-${i}`,
        };

        ids.push(id);
        callbacksArray.push(callbacks);
        storeCallbacks(id, callbacks);
      }

      // Verify all are stored correctly
      ids.forEach((id, index) => {
        expect(getCallbacks(id)).toEqual(callbacksArray[index]);
      });

      // Cleanup some
      cleanupCallbacks(ids[0]);
      cleanupCallbacks(ids[2]);

      // Verify correct ones are cleaned up
      expect(getCallbacks(ids[0])).toBeUndefined();
      expect(getCallbacks(ids[1])).toEqual(callbacksArray[1]);
      expect(getCallbacks(ids[2])).toBeUndefined();
      expect(getCallbacks(ids[3])).toEqual(callbacksArray[3]);
      expect(getCallbacks(ids[4])).toEqual(callbacksArray[4]);
    });
  });
});
