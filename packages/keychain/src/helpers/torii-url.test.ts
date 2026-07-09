import { describe, expect, it } from "vitest";
import { getToriiUrl } from "./torii-url";

describe("getToriiUrl compatibility", () => {
  it("uses an explicit Torii URL ahead of the legacy Slot project", () => {
    expect(
      getToriiUrl(
        "legacy-game",
        "https://torii.example.com/custom/indexer////",
      ),
    ).toBe("https://torii.example.com/custom/indexer");
  });

  it("normalizes an explicit Torii URL without changing its path", () => {
    expect(getToriiUrl(null, "https://torii.example.com/a/b///")).toBe(
      "https://torii.example.com/a/b",
    );
  });

  it("keeps the Slot-derived fallback used by Controller 0.13.12", () => {
    expect(getToriiUrl("legacy-game", null)).toBe(
      "https://api.cartridge.gg/x/legacy-game/torii",
    );
  });

  it("returns null when neither protocol generation configures Torii", () => {
    expect(getToriiUrl(null, null)).toBeNull();
  });
});
