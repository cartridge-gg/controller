import { describe, expect, it } from "vitest";
import type { ResponsibleGamingData } from "./responsible-gaming";
import {
  clampSessionDurationSeconds,
  effectiveSessionCapSeconds,
  exceedsSessionCap,
  formatCents,
  formatDurationSeconds,
  mapResponsibleGamingError,
} from "./responsible-gaming";

const HOUR = 3600;

function rg(
  overrides: Partial<ResponsibleGamingData> = {},
): ResponsibleGamingData {
  return {
    period: "WEEKLY",
    windowStart: null,
    sessionMaxDurationSeconds: null,
    pendingSessionMaxDurationSeconds: null,
    pendingSessionRemoval: false,
    pendingEffectiveAt: null,
    deposit: {
      amountCents: null,
      usedCents: 0,
      pendingAmountCents: null,
      pendingRemoval: false,
    },
    spending: {
      amountCents: null,
      usedCents: 0,
      pendingAmountCents: null,
      pendingRemoval: false,
    },
    ...overrides,
  };
}

describe("effectiveSessionCapSeconds", () => {
  it("returns null when no data", () => {
    expect(effectiveSessionCapSeconds(null)).toBeNull();
    expect(effectiveSessionCapSeconds(undefined)).toBeNull();
  });

  it("returns null when uncapped", () => {
    expect(effectiveSessionCapSeconds(rg())).toBeNull();
  });

  it("returns the active cap as a bigint", () => {
    expect(
      effectiveSessionCapSeconds(rg({ sessionMaxDurationSeconds: HOUR })),
    ).toBe(BigInt(HOUR));
  });

  it("ignores a pending increase (not yet effective)", () => {
    const data = rg({
      sessionMaxDurationSeconds: HOUR,
      pendingSessionMaxDurationSeconds: 24 * HOUR,
      pendingEffectiveAt: "2099-01-01T00:00:00Z",
    });
    // Effective cap is still the active 1h, not the pending 24h.
    expect(effectiveSessionCapSeconds(data)).toBe(BigInt(HOUR));
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

describe("exceedsSessionCap", () => {
  it("is false when uncapped", () => {
    expect(exceedsSessionCap(BigInt(100 * HOUR), null)).toBe(false);
  });
  it("detects over-cap requests", () => {
    expect(exceedsSessionCap(BigInt(2 * HOUR), BigInt(HOUR))).toBe(true);
    expect(exceedsSessionCap(BigInt(HOUR), BigInt(HOUR))).toBe(false);
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

describe("mapResponsibleGamingError", () => {
  it("maps cooling-off errors", () => {
    const msg = mapResponsibleGamingError(
      new Error("limit decrease is subject to a cooling-off period"),
    );
    expect(msg.toLowerCase()).toContain("cooling-off period");
  });

  it("maps already-pending errors", () => {
    const msg = mapResponsibleGamingError(
      new Error("a pending change already exists"),
    );
    expect(msg.toLowerCase()).toContain("pending limit change");
  });

  it("maps deposit limit exceeded", () => {
    const msg = mapResponsibleGamingError(
      new Error("deposit would exceed limit"),
    );
    expect(msg.toLowerCase()).toContain("deposit limit");
  });

  it("maps spending limit exceeded", () => {
    const msg = mapResponsibleGamingError(
      new Error("spending limit exceeded for period"),
    );
    expect(msg.toLowerCase()).toContain("spending limit");
  });

  it("respects a structured extensions.code", () => {
    const msg = mapResponsibleGamingError({
      message: "denied",
      extensions: { code: "RG_COOLING_OFF" },
    });
    expect(msg.toLowerCase()).toContain("cooling-off period");
  });

  it("falls back to the raw message for unknown errors", () => {
    expect(mapResponsibleGamingError(new Error("weird backend failure"))).toBe(
      "weird backend failure",
    );
  });

  it("has a generic fallback for empty errors", () => {
    expect(mapResponsibleGamingError(undefined)).toContain(
      "Something went wrong",
    );
  });
});
