import { resolveChildOrigin } from "../iframe/security";

describe("resolveChildOrigin", () => {
  it("uses keychain URL origin when configured origin is omitted", () => {
    const origin = resolveChildOrigin(
      new URL("https://x.cartridge.gg/session"),
    );
    expect(origin).toBe("https://x.cartridge.gg");
  });

  it("accepts matching configured origin", () => {
    const origin = resolveChildOrigin(
      new URL("https://x.cartridge.gg/session"),
      "https://x.cartridge.gg/path",
    );

    expect(origin).toBe("https://x.cartridge.gg");
  });

  it("throws when configured origin does not match keychain URL origin", () => {
    expect(() =>
      resolveChildOrigin(
        new URL("https://x.cartridge.gg/session"),
        "https://evil.example.com",
      ),
    ).toThrow("Keychain URL origin mismatch");
  });

  it("throws when keychain URL protocol is not http/https", () => {
    expect(() => resolveChildOrigin(new URL("javascript:alert(1)"))).toThrow(
      "Only http: and https: are allowed.",
    );
  });

  it("throws when configured origin protocol is not http/https", () => {
    expect(() =>
      resolveChildOrigin(new URL("https://x.cartridge.gg"), "data:text/html"),
    ).toThrow("Only http: and https: are allowed.");
  });
});
