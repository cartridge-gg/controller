import {
  buildIframeAllowList,
  isLocalhostHostname,
  validateKeychainIframeUrl,
} from "../iframe/security";

describe("iframe security", () => {
  describe("isLocalhostHostname", () => {
    it("returns true for localhost hosts", () => {
      expect(isLocalhostHostname("localhost")).toBe(true);
      expect(isLocalhostHostname("app.localhost")).toBe(true);
      expect(isLocalhostHostname("127.0.0.1")).toBe(true);
      expect(isLocalhostHostname("[::1]")).toBe(true);
      expect(isLocalhostHostname("::1")).toBe(true);
    });

    it("returns false for non-local hosts", () => {
      expect(isLocalhostHostname("example.com")).toBe(false);
      expect(isLocalhostHostname("localhost.example.com")).toBe(false);
    });
  });

  describe("validateKeychainIframeUrl", () => {
    it("allows https URLs", () => {
      expect(() =>
        validateKeychainIframeUrl(new URL("https://x.cartridge.gg")),
      ).not.toThrow();
    });

    it("allows localhost http URLs for development", () => {
      expect(() =>
        validateKeychainIframeUrl(new URL("http://localhost:3001")),
      ).not.toThrow();
      expect(() =>
        validateKeychainIframeUrl(new URL("http://127.0.0.1:3001")),
      ).not.toThrow();
      expect(() =>
        validateKeychainIframeUrl(new URL("http://[::1]:3001")),
      ).not.toThrow();
    });

    it("rejects insecure remote http URLs", () => {
      expect(() =>
        validateKeychainIframeUrl(new URL("http://evil.example")),
      ).toThrow(
        "Invalid keychain iframe URL: only https:// or local http:// URLs are allowed",
      );
    });

    it("rejects non-http(s) protocols", () => {
      expect(() =>
        validateKeychainIframeUrl(new URL("javascript:alert(1)")),
      ).toThrow(
        "Invalid keychain iframe URL: only https:// or local http:// URLs are allowed",
      );

      expect(() =>
        validateKeychainIframeUrl(new URL("data:text/html,<h1>xss</h1>")),
      ).toThrow(
        "Invalid keychain iframe URL: only https:// or local http:// URLs are allowed",
      );
    });

    it("rejects credentialed URLs", () => {
      expect(() =>
        validateKeychainIframeUrl(new URL("https://user:pass@x.cartridge.gg")),
      ).toThrow("Invalid keychain iframe URL: credentials are not allowed");
    });
  });

  describe("buildIframeAllowList", () => {
    it("does not include local-network-access for remote URLs", () => {
      const allowList = buildIframeAllowList(new URL("https://x.cartridge.gg"));
      expect(allowList).toContain("publickey-credentials-create *");
      expect(allowList).toContain("payment *");
      expect(allowList).not.toContain("local-network-access *");
    });

    it("includes local-network-access for localhost development URLs", () => {
      const allowList = buildIframeAllowList(new URL("http://localhost:3001"));
      expect(allowList).toContain("local-network-access *");
    });
  });
});
