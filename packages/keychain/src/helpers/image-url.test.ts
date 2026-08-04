import { describe, expect, it } from "vitest";
import { resolveMetadataImage, resolveNestedImageUri } from "./image-url";

const MALFORMED_IMAGE_URI =
  "data:image/svg+xml;base64,aHR0cHM6Ly9zdGF0aWMuY2FydHJpZGdlLmdnL3ByZXNldHMvZ2xpdGNoLWJvbWIvaWNvbi5wbmc=";
const NESTED_IMAGE_URI =
  "https://static.cartridge.gg/presets/glitch-bomb/icon.png";

describe("resolveNestedImageUri", () => {
  it("resolves an image URL encoded inside a data URI", () => {
    expect(resolveNestedImageUri(MALFORMED_IMAGE_URI)).toBe(NESTED_IMAGE_URI);
  });

  it("does not unwrap valid inline SVG data", () => {
    const svgDataUri = "data:image/svg+xml;base64,PHN2Zy8+";

    expect(resolveNestedImageUri(svgDataUri)).toBeUndefined();
  });

  it("ignores plain URLs", () => {
    expect(
      resolveNestedImageUri("https://example.com/token.png"),
    ).toBeUndefined();
  });

  it("ignores invalid base64 payloads", () => {
    expect(
      resolveNestedImageUri("data:image/svg+xml;base64,%%%"),
    ).toBeUndefined();
  });
});

describe("resolveMetadataImage", () => {
  it("returns the nested URI for malformed data URIs", () => {
    expect(resolveMetadataImage(MALFORMED_IMAGE_URI)).toBe(NESTED_IMAGE_URI);
  });

  it("returns regular metadata images untouched", () => {
    expect(resolveMetadataImage("ipfs://token-image")).toBe(
      "ipfs://token-image",
    );
  });

  it("returns undefined for empty input", () => {
    expect(resolveMetadataImage(undefined)).toBeUndefined();
    expect(resolveMetadataImage("")).toBeUndefined();
  });
});
