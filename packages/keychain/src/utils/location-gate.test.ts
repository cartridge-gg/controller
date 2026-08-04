import { afterEach, describe, expect, it, vi } from "vitest";
import { reverseGeocodeLocation } from "./location-gate";

describe("reverseGeocodeLocation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("resolves browser coordinates to country and region codes", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        countryCode: "US",
        principalSubdivisionCode: "US-NY",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      reverseGeocodeLocation({ latitude: 40.7128, longitude: -74.006 }),
    ).resolves.toEqual({ countryCode: "US", regionCode: "US-NY" });

    const requestedUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(requestedUrl.hostname).toBe("api.bigdatacloud.net");
    expect(requestedUrl.searchParams.get("latitude")).toBe("40.7128");
    expect(requestedUrl.searchParams.get("longitude")).toBe("-74.006");
  });

  it("rejects a response that cannot resolve a country", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      }),
    );

    await expect(
      reverseGeocodeLocation({ latitude: 0, longitude: 0 }),
    ).rejects.toThrow("did not resolve to a country");
  });

  it("rejects a failed reverse-geocoding response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      }),
    );

    await expect(
      reverseGeocodeLocation({ latitude: 40.7128, longitude: -74.006 }),
    ).rejects.toThrow("Failed to resolve browser location");
  });
});
