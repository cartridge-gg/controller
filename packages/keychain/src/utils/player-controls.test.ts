import { describe, expect, it } from "vitest";
import { PlayerControlsPeriod } from "@/utils/api";
import type { PlayerControlsData } from "./player-controls";
import {
  clampSessionDurationSeconds,
  effectivePlayTimeCapSeconds,
  exceedsPlayTimeCap,
  formatCents,
  formatDurationSeconds,
  mapPlayerControlsError,
} from "./player-controls";

const HOUR = 3600;

function pc(overrides: Partial<PlayerControlsData> = {}): PlayerControlsData {
  return {
    period: PlayerControlsPeriod.Weekly,
    windowStart: null,
    playTimeMaxDurationSeconds: null,
    pendingPlayTimeMaxDurationSeconds: null,
    pendingPlayTimeRemoval: false,
    pendingEffectiveAt: null,
    creditsPurchase: {
      amountCents: null,
      usedCents: 0,
      pendingAmountCents: null,
      pendingRemoval: false,
    },
    entryPurchase: {
      amountCents: null,
      usedCents: 0,
      pendingAmountCents: null,
      pendingRemoval: false,
    },
    ...overrides,
  };
}

describe("effectivePlayTimeCapSeconds", () => {
  it("returns null when no data", () => {
    expect(effectivePlayTimeCapSeconds(null)).toBeNull();
    expect(effectivePlayTimeCapSeconds(undefined)).toBeNull();
  });

  it("returns null when uncapped", () => {
    expect(effectivePlayTimeCapSeconds(pc())).toBeNull();
  });

  it("returns the active cap as a bigint", () => {
    expect(
      effectivePlayTimeCapSeconds(pc({ playTimeMaxDurationSeconds: HOUR })),
    ).toBe(BigInt(HOUR));
  });

  it("ignores a pending increase (not yet effective)", () => {
    const data = pc({
      playTimeMaxDurationSeconds: HOUR,
      pendingPlayTimeMaxDurationSeconds: 24 * HOUR,
      pendingEffectiveAt: "2099-01-01T00:00:00Z",
    });
    // Effective cap is still the active 1h, not the pending 24h.
    expect(effectivePlayTimeCapSeconds(data)).toBe(BigInt(HOUR));
  });
});

describe("clampSessionDurationSeconds", () => {
  it("passes through when uncapped", () => {
    expect(clampSessionDurationSeconds(BigInt(100 * HOUR), null)).toBe(
      BigInt(100 * HOUR),
    );
  });

  it("clamps a request above the cap", () => {
    expect(
      clampSessionDurationSeconds(BigInt(7 * 24 * HOUR), BigInt(HOUR)),
    ).toBe(BigInt(HOUR));
  });

  it("leaves a request at or below the cap unchanged", () => {
    expect(clampSessionDurationSeconds(BigInt(HOUR), BigInt(24 * HOUR))).toBe(
      BigInt(HOUR),
    );
    expect(clampSessionDurationSeconds(BigInt(HOUR), BigInt(HOUR))).toBe(
      BigInt(HOUR),
    );
  });
});

describe("exceedsPlayTimeCap", () => {
  it("is false when uncapped", () => {
    expect(exceedsPlayTimeCap(BigInt(100 * HOUR), null)).toBe(false);
  });
  it("detects over-cap requests", () => {
    expect(exceedsPlayTimeCap(BigInt(2 * HOUR), BigInt(HOUR))).toBe(true);
    expect(exceedsPlayTimeCap(BigInt(HOUR), BigInt(HOUR))).toBe(false);
  });
});

describe("formatCents", () => {
  it("formats cents as USD", () => {
    expect(formatCents(1234)).toBe("$12.34");
    expect(formatCents(0)).toBe("$0.00");
  });
  it("shows a dash when unset", () => {
    expect(formatCents(null)).toBe("—");
    expect(formatCents(undefined)).toBe("—");
  });
});

describe("formatDurationSeconds", () => {
  it("returns No limit when unset", () => {
    expect(formatDurationSeconds(null)).toBe("No limit");
  });
  it("formats days/hours/minutes", () => {
    expect(formatDurationSeconds(7 * 24 * HOUR)).toBe("7d");
    expect(formatDurationSeconds(2 * HOUR)).toBe("2h");
    expect(formatDurationSeconds(90)).toBe("1m");
    expect(formatDurationSeconds(30)).toBe("30s");
  });
});

describe("mapPlayerControlsError", () => {
  it("maps cooling-off errors", () => {
    const msg = mapPlayerControlsError(
      new Error("limit decrease is subject to a cooling-off period"),
    );
    expect(msg.toLowerCase()).toContain("cooling-off period");
  });

  it("maps already-pending errors", () => {
    const msg = mapPlayerControlsError(
      new Error("a pending change already exists"),
    );
    expect(msg.toLowerCase()).toContain("pending limit change");
  });

  it("maps credits purchase limit exceeded", () => {
    const msg = mapPlayerControlsError(
      new Error("credits purchase would exceed limit"),
    );
    expect(msg.toLowerCase()).toContain("credits purchase limit");
  });

  it("maps entry and purchase limit exceeded", () => {
    const msg = mapPlayerControlsError(
      new Error("entry purchase limit exceeded for period"),
    );
    expect(msg.toLowerCase()).toContain("entry and purchase limit");
  });

  it("maps play-time limit exceeded", () => {
    const msg = mapPlayerControlsError(
      new Error("requested play time exceeds maximum duration"),
    );
    expect(msg.toLowerCase()).toContain("play-time");
  });

  it("respects a structured extensions.code", () => {
    const msg = mapPlayerControlsError({
      message: "denied",
      extensions: { code: "PC_COOLING_OFF" },
    });
    expect(msg.toLowerCase()).toContain("cooling-off period");
  });

  it("falls back to the raw message for unknown errors", () => {
    expect(mapPlayerControlsError(new Error("weird backend failure"))).toBe(
      "weird backend failure",
    );
  });

  it("has a generic fallback for empty errors", () => {
    expect(mapPlayerControlsError(undefined)).toContain("Something went wrong");
  });
});
