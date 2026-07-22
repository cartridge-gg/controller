import { getImageUrlCandidates, resolveNestedImageUri } from "./image-url";

const MALFORMED_IMAGE_URI =
  "data:image/svg+xml;base64,aHR0cHM6Ly9zdGF0aWMuY2FydHJpZGdlLmdnL3ByZXNldHMvZ2xpdGNoLWJvbWIvaWNvbi5wbmc=";
const NESTED_IMAGE_URI =
  "https://static.cartridge.gg/presets/glitch-bomb/icon.png";

describe("image URL helpers", () => {
  it("resolves an image URL encoded inside a data URI", () => {
    expect(resolveNestedImageUri(MALFORMED_IMAGE_URI)).toBe(NESTED_IMAGE_URI);
  });

  it("promotes nested image URLs ahead of Torii candidates", () => {
    expect(
      getImageUrlCandidates(
        ["https://torii.example/static/token/image"],
        MALFORMED_IMAGE_URI,
      ),
    ).toEqual([NESTED_IMAGE_URI, "https://torii.example/static/token/image"]);
  });

  it("preserves candidate order for regular metadata images", () => {
    const metadataImageUri = "https://example.com/token.png";

    expect(
      getImageUrlCandidates(
        ["https://torii.example/static/token/image"],
        metadataImageUri,
      ),
    ).toEqual(["https://torii.example/static/token/image", metadataImageUri]);
  });

  it("does not unwrap valid inline SVG data", () => {
    const svgDataUri = "data:image/svg+xml;base64,PHN2Zy8+";

    expect(resolveNestedImageUri(svgDataUri)).toBeUndefined();
  });
});
