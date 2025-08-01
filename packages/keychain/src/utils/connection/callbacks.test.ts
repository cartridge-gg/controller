import { describe, expect, it, beforeEach } from "vitest";
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
    it("should generate incremental IDs", () => {
      const id1 = generateCallbackId();
      const id2 = generateCallbackId();
      const id3 = generateCallbackId();

      expect(parseInt(id1)).toBeLessThan(parseInt(id2));
      expect(parseInt(id2)).toBeLessThan(parseInt(id3));
    });

    it("should generate string IDs", () => {
      const id = generateCallbackId();
      expect(typeof id).toBe("string");
      expect(id).toMatch(/^\d+$/);
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
