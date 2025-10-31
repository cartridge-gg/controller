import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  storeReferral,
  getReferral,
  clearReferral,
  hasValidReferral,
  getRemainingAttributionDays,
  type ReferralData,
} from "./referral";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("Referral Utilities", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe("storeReferral", () => {
    it("should store referral data with ref only", () => {
      const ref = "testuser";
      const gameUrl = "lootsurvivor.io";
      const result = storeReferral(ref, gameUrl);

      expect(result.ref).toBe(ref);
      expect(result.refGroup).toBeUndefined();
      expect(result.capturedAt).toBeDefined();
      expect(result.expiresAt).toBeDefined();
      expect(result.expiresAt).toBeGreaterThan(result.capturedAt);
    });

    it("should store referral data with ref and refGroup", () => {
      const ref = "testuser";
      const gameUrl = "lootsurvivor.io";
      const refGroup = "campaign1";
      const result = storeReferral(ref, gameUrl, refGroup);

      expect(result.ref).toBe(ref);
      expect(result.refGroup).toBe(refGroup);
    });

    it("should trim whitespace from ref and refGroup", () => {
      const gameUrl = "lootsurvivor.io";
      const result = storeReferral("  testuser  ", gameUrl, "  campaign1  ");

      expect(result.ref).toBe("testuser");
      expect(result.refGroup).toBe("campaign1");
    });

    it("should set expiration to 30 days from now", () => {
      const now = Date.now();
      const gameUrl = "lootsurvivor.io";
      const result = storeReferral("testuser", gameUrl);
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

      expect(result.expiresAt - result.capturedAt).toBe(thirtyDaysInMs);
      expect(result.capturedAt).toBeGreaterThanOrEqual(now);
      expect(result.capturedAt).toBeLessThanOrEqual(Date.now());
    });

    it("should not overwrite existing ref but allow refGroup updates", () => {
      const gameUrl = "lootsurvivor.io";

      // First referral
      const firstRef = "alice";
      const firstRefGroup = "campaign1";
      const firstResult = storeReferral(firstRef, gameUrl, firstRefGroup);

      // Try to store a different referral for the same game with a different refGroup
      const secondRef = "bob";
      const secondRefGroup = "campaign2";
      const secondResult = storeReferral(secondRef, gameUrl, secondRefGroup);

      // Should keep the first ref (first-touch attribution)
      // But should update to the second refGroup
      expect(secondResult.ref).toBe(firstRef);
      expect(secondResult.refGroup).toBe(secondRefGroup); // Updated!
      expect(secondResult.capturedAt).toBe(firstResult.capturedAt);
      expect(secondResult.expiresAt).toBe(firstResult.expiresAt);

      // Verify localStorage has the updated refGroup
      const stored = getReferral(gameUrl);
      expect(stored?.ref).toBe(firstRef);
      expect(stored?.refGroup).toBe(secondRefGroup);
    });

    it("should allow updating refGroup when ref stays the same", () => {
      const gameUrl = "lootsurvivor.io";

      // First referral with refGroup
      const ref = "alice";
      const firstRefGroup = "campaign1";
      const firstResult = storeReferral(ref, gameUrl, firstRefGroup);

      // Update with same ref but different refGroup
      const secondRefGroup = "campaign2";
      const secondResult = storeReferral(ref, gameUrl, secondRefGroup);

      // Should keep same ref and update refGroup
      expect(secondResult.ref).toBe(ref);
      expect(secondResult.refGroup).toBe(secondRefGroup);
      expect(secondResult.capturedAt).toBe(firstResult.capturedAt);
      expect(secondResult.expiresAt).toBe(firstResult.expiresAt);
    });

    it("should not update when ref and refGroup are the same", () => {
      const gameUrl = "lootsurvivor.io";

      // First referral
      const ref = "alice";
      const refGroup = "campaign1";
      const firstResult = storeReferral(ref, gameUrl, refGroup);

      // Try to store the exact same referral again
      const secondResult = storeReferral(ref, gameUrl, refGroup);

      // Should return the same object without modification
      expect(secondResult.ref).toBe(firstResult.ref);
      expect(secondResult.refGroup).toBe(firstResult.refGroup);
      expect(secondResult.capturedAt).toBe(firstResult.capturedAt);
      expect(secondResult.expiresAt).toBe(firstResult.expiresAt);
    });

    it("should allow setting refGroup when it was initially undefined", () => {
      const gameUrl = "lootsurvivor.io";

      // First referral without refGroup
      const ref = "alice";
      const firstResult = storeReferral(ref, gameUrl);

      expect(firstResult.refGroup).toBeUndefined();

      // Update with refGroup
      const refGroup = "campaign1";
      const secondResult = storeReferral(ref, gameUrl, refGroup);

      // Should keep same ref and add refGroup
      expect(secondResult.ref).toBe(ref);
      expect(secondResult.refGroup).toBe(refGroup);
      expect(secondResult.capturedAt).toBe(firstResult.capturedAt);
      expect(secondResult.expiresAt).toBe(firstResult.expiresAt);
    });

    it("should allow removing refGroup (setting to undefined)", () => {
      const gameUrl = "lootsurvivor.io";

      // First referral with refGroup
      const ref = "alice";
      const refGroup = "campaign1";
      const firstResult = storeReferral(ref, gameUrl, refGroup);

      expect(firstResult.refGroup).toBe(refGroup);

      // Update without refGroup
      const secondResult = storeReferral(ref, gameUrl);

      // Should keep same ref and remove refGroup
      expect(secondResult.ref).toBe(ref);
      expect(secondResult.refGroup).toBeUndefined();
      expect(secondResult.capturedAt).toBe(firstResult.capturedAt);
      expect(secondResult.expiresAt).toBe(firstResult.expiresAt);
    });

    it("should allow new referral after previous one expires", () => {
      const gameUrl = "lootsurvivor.io";

      // Store first referral and manually expire it
      storeReferral("alice", gameUrl, "campaign1");
      const expiredData: ReferralData = {
        ref: "alice",
        refAddress: "",
        refGroup: "campaign1",
        capturedAt: Date.now() - 31 * 24 * 60 * 60 * 1000, // 31 days ago
        expiresAt: Date.now() - 24 * 60 * 60 * 1000, // Expired yesterday
      };
      const storage = { [gameUrl]: expiredData };
      localStorage.setItem("@cartridge/referral", JSON.stringify(storage));

      // Try to store a new referral
      const newRef = "bob";
      const newRefGroup = "campaign2";
      const result = storeReferral(newRef, gameUrl, newRefGroup);

      // Should accept the new referral since the old one expired
      expect(result.ref).toBe(newRef);
      expect(result.refGroup).toBe(newRefGroup);
      expect(result.expiresAt).toBeGreaterThan(Date.now());
    });
  });

  describe("getReferral", () => {
    it("should return null when no referral is stored", () => {
      const gameUrl = "lootsurvivor.io";
      expect(getReferral(gameUrl)).toBeNull();
    });

    it("should return stored referral data", () => {
      const ref = "testuser";
      const gameUrl = "lootsurvivor.io";
      const refGroup = "campaign1";
      storeReferral(ref, gameUrl, refGroup);

      const result = getReferral(gameUrl);

      expect(result).not.toBeNull();
      expect(result?.ref).toBe(ref);
      expect(result?.refGroup).toBe(refGroup);
    });

    it("should return null and clear storage if referral has expired", () => {
      const ref = "testuser";
      const gameUrl = "lootsurvivor.io";
      storeReferral(ref, gameUrl);

      // Manually set an expired referral for this game
      const expiredData: ReferralData = {
        ref,
        refAddress: "",
        capturedAt: Date.now() - 31 * 24 * 60 * 60 * 1000, // 31 days ago
        expiresAt: Date.now() - 24 * 60 * 60 * 1000, // Expired yesterday
      };
      const storage = { [gameUrl]: expiredData };
      localStorage.setItem("@cartridge/referral", JSON.stringify(storage));

      const result = getReferral(gameUrl);

      expect(result).toBeNull();
      // Check that the specific game referral was cleared
      const remaining = JSON.parse(
        localStorage.getItem("@cartridge/referral") || "{}",
      );
      expect(remaining[gameUrl]).toBeUndefined();
    });

    it("should return referral if not expired", () => {
      const ref = "testuser";
      const gameUrl = "lootsurvivor.io";
      const now = Date.now();
      const validData: ReferralData = {
        ref,
        refAddress: "",
        capturedAt: now,
        expiresAt: now + 10 * 24 * 60 * 60 * 1000, // Expires in 10 days
      };
      const storage = { [gameUrl]: validData };
      localStorage.setItem("@cartridge/referral", JSON.stringify(storage));

      const result = getReferral(gameUrl);

      expect(result).not.toBeNull();
      expect(result?.ref).toBe(ref);
    });
  });

  describe("clearReferral", () => {
    it("should remove referral data for a specific game", () => {
      const gameUrl = "lootsurvivor.io";
      storeReferral("testuser", gameUrl);
      expect(getReferral(gameUrl)).not.toBeNull();

      clearReferral(gameUrl);
      expect(getReferral(gameUrl)).toBeNull();
    });

    it("should remove all referral data when no gameUrl provided", () => {
      const game1 = "lootsurvivor.io";
      const game2 = "anothergame.io";
      storeReferral("testuser", game1);
      storeReferral("testuser2", game2);

      clearReferral();

      expect(getReferral(game1)).toBeNull();
      expect(getReferral(game2)).toBeNull();
    });

    it("should not throw when clearing non-existent referral", () => {
      expect(() => clearReferral("nonexistent.io")).not.toThrow();
    });
  });

  describe("hasValidReferral", () => {
    it("should return false when no referral exists", () => {
      const gameUrl = "lootsurvivor.io";
      expect(hasValidReferral(gameUrl)).toBe(false);
    });

    it("should return true when valid referral exists", () => {
      const gameUrl = "lootsurvivor.io";
      storeReferral("testuser", gameUrl);
      expect(hasValidReferral(gameUrl)).toBe(true);
    });

    it("should return false when referral has expired", () => {
      const gameUrl = "lootsurvivor.io";
      const expiredData: ReferralData = {
        ref: "testuser",
        refAddress: "",
        capturedAt: Date.now() - 31 * 24 * 60 * 60 * 1000,
        expiresAt: Date.now() - 24 * 60 * 60 * 1000,
      };
      const storage = { [gameUrl]: expiredData };
      localStorage.setItem("@cartridge/referral", JSON.stringify(storage));

      expect(hasValidReferral(gameUrl)).toBe(false);
    });
  });

  describe("per-game isolation", () => {
    it("should store and retrieve referrals independently per game", () => {
      const game1 = "lootsurvivor.io";
      const game2 = "anothergame.io";

      storeReferral("alice", game1, "campaign1");
      storeReferral("bob", game2, "campaign2");

      const referral1 = getReferral(game1);
      const referral2 = getReferral(game2);

      expect(referral1?.ref).toBe("alice");
      expect(referral1?.refGroup).toBe("campaign1");
      expect(referral2?.ref).toBe("bob");
      expect(referral2?.refGroup).toBe("campaign2");
    });

    it("should clear referral for one game without affecting others", () => {
      const game1 = "lootsurvivor.io";
      const game2 = "anothergame.io";

      storeReferral("alice", game1);
      storeReferral("bob", game2);

      clearReferral(game1);

      expect(getReferral(game1)).toBeNull();
      expect(getReferral(game2)).not.toBeNull();
      expect(getReferral(game2)?.ref).toBe("bob");
    });
  });

  describe("getRemainingAttributionDays", () => {
    it("should return null when no referral exists", () => {
      const gameUrl = "lootsurvivor.io";
      expect(getRemainingAttributionDays(gameUrl)).toBeNull();
    });

    it("should return correct number of days remaining", () => {
      const gameUrl = "lootsurvivor.io";
      const now = Date.now();
      const validData: ReferralData = {
        ref: "testuser",
        refAddress: "",
        capturedAt: now,
        expiresAt: now + 15 * 24 * 60 * 60 * 1000, // 15 days from now
      };
      const storage = { [gameUrl]: validData };
      localStorage.setItem("@cartridge/referral", JSON.stringify(storage));

      const remaining = getRemainingAttributionDays(gameUrl);

      expect(remaining).toBeGreaterThanOrEqual(14);
      expect(remaining).toBeLessThanOrEqual(15);
    });

    it("should return 0 for referrals expiring today", () => {
      const gameUrl = "lootsurvivor.io";
      const now = Date.now();
      const validData: ReferralData = {
        ref: "testuser",
        refAddress: "",
        capturedAt: now - 29 * 24 * 60 * 60 * 1000,
        expiresAt: now + 60 * 1000, // Expires in 1 minute
      };
      const storage = { [gameUrl]: validData };
      localStorage.setItem("@cartridge/referral", JSON.stringify(storage));

      const remaining = getRemainingAttributionDays(gameUrl);

      expect(remaining).toBe(1); // Should round up to 1 day
    });

    it("should return null for expired referrals", () => {
      const gameUrl = "lootsurvivor.io";
      const expiredData: ReferralData = {
        ref: "testuser",
        refAddress: "",
        capturedAt: Date.now() - 31 * 24 * 60 * 60 * 1000,
        expiresAt: Date.now() - 24 * 60 * 60 * 1000,
      };
      const storage = { [gameUrl]: expiredData };
      localStorage.setItem("@cartridge/referral", JSON.stringify(storage));

      expect(getRemainingAttributionDays(gameUrl)).toBeNull();
    });
  });
});
