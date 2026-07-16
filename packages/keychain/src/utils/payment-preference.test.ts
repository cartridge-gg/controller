import { describe, expect, it } from "vitest";
import {
  paymentPreferenceKey,
  readPaymentPreference,
  resolveInitialPaymentMethod,
  writePaymentPreference,
} from "./payment-preference";

const memoryStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
};

describe("payment preference", () => {
  it("isolates explicit choices by origin and chain", () => {
    const storage = memoryStorage();
    writePaymentPreference({
      origin: "https://glitchbomb.game",
      chainId: "0x1",
      method: "credits",
      storage,
    });

    expect(
      readPaymentPreference({
        origin: "https://glitchbomb.game",
        chainId: "0x1",
        configuredDefault: true,
        storage,
      }),
    ).toBe("credits");
    expect(
      readPaymentPreference({
        origin: "https://other.game",
        chainId: "0x1",
        configuredDefault: true,
        storage,
      }),
    ).toBeUndefined();
    expect(paymentPreferenceKey("https://glitchbomb.game", "0x1")).toContain(
      encodeURIComponent("https://glitchbomb.game"),
    );
  });

  it("ignores a legacy cross-game choice when a default is configured", () => {
    const storage = memoryStorage();
    storage.setItem("@cartridge/lastPaymentMethod:0x1", "coinflow");

    expect(
      readPaymentPreference({
        origin: "https://glitchbomb.game",
        chainId: "0x1",
        configuredDefault: true,
        storage,
      }),
    ).toBeUndefined();
  });

  it("keeps funded Controller ahead of the configured default", () => {
    expect(
      resolveInitialPaymentMethod({
        configuredDefault: true,
        funding: "funded",
        credits: "available",
        hasSufficientCredits: true,
        cardTopupAvailable: true,
        directCardAvailable: true,
      }),
    ).toEqual({ status: "resolved", method: "controller" });
  });

  it("preserves legacy Controller behavior when no default is configured", () => {
    expect(
      resolveInitialPaymentMethod({
        configuredDefault: false,
        funding: "pending",
        credits: "pending",
        hasSufficientCredits: false,
        cardTopupAvailable: false,
        directCardAvailable: false,
      }),
    ).toEqual({ status: "resolved", method: "controller" });
  });

  it("selects credits only after Controller funding is exhausted", () => {
    expect(
      resolveInitialPaymentMethod({
        configuredDefault: true,
        funding: "exhausted",
        credits: "available",
        hasSufficientCredits: false,
        cardTopupAvailable: true,
        directCardAvailable: true,
      }),
    ).toEqual({ status: "resolved", method: "credits" });
  });

  it("honors an explicit per-game preference", () => {
    expect(
      resolveInitialPaymentMethod({
        remembered: "credits",
        configuredDefault: true,
        funding: "funded",
        credits: "available",
        hasSufficientCredits: true,
        cardTopupAvailable: true,
        directCardAvailable: true,
      }),
    ).toEqual({ status: "resolved", method: "credits" });
  });

  it("uses credits when Controller funding is indeterminate but card top-up is available", () => {
    expect(
      resolveInitialPaymentMethod({
        configuredDefault: true,
        funding: "indeterminate",
        credits: "available",
        hasSufficientCredits: false,
        cardTopupAvailable: true,
        directCardAvailable: true,
      }),
    ).toEqual({ status: "resolved", method: "credits" });
  });

  it("shows the picker when funding is indeterminate and credits are unavailable", () => {
    expect(
      resolveInitialPaymentMethod({
        configuredDefault: true,
        funding: "indeterminate",
        credits: "unavailable",
        hasSufficientCredits: false,
        cardTopupAvailable: true,
        directCardAvailable: true,
      }),
    ).toEqual({
      status: "resolved",
      method: "controller",
      showMethodPicker: true,
    });
  });
});
