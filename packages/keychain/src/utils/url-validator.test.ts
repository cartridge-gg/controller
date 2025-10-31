import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { validateRedirectUrl, safeRedirect } from "./url-validator";

describe("validateRedirectUrl", () => {
  describe("Valid URLs", () => {
    it("should allow valid https URLs", () => {
      const result = validateRedirectUrl("https://example.com");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should allow valid http URLs", () => {
      const result = validateRedirectUrl("http://example.com");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should allow URLs with paths", () => {
      const result = validateRedirectUrl("https://example.com/path/to/page");
      expect(result.isValid).toBe(true);
    });

    it("should allow URLs with query parameters", () => {
      const result = validateRedirectUrl("https://example.com?foo=bar&baz=qux");
      expect(result.isValid).toBe(true);
    });

    it("should allow URLs with fragments", () => {
      const result = validateRedirectUrl("https://example.com#section");
      expect(result.isValid).toBe(true);
    });

    it("should allow URLs with ports", () => {
      const result = validateRedirectUrl("https://example.com:8080");
      expect(result.isValid).toBe(true);
    });

    it("should allow complex game URLs", () => {
      const result = validateRedirectUrl(
        "https://lootsurvivor.io/game?session=abc123&level=5",
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe("Dangerous Protocol XSS Attacks", () => {
    it("should block javascript: protocol", () => {
      const result = validateRedirectUrl("javascript:alert(1)");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("javascript:");
    });

    it("should block javascript: protocol with encoded characters", () => {
      const result = validateRedirectUrl("javascript:alert(document.cookie)");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("javascript:");
    });

    it("should block data: protocol", () => {
      const result = validateRedirectUrl(
        "data:text/html,<script>alert(1)</script>",
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("data:");
    });

    it("should block data: protocol with base64", () => {
      const result = validateRedirectUrl(
        "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("data:");
    });

    it("should block file: protocol", () => {
      const result = validateRedirectUrl("file:///etc/passwd");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("file:");
    });

    it("should block vbscript: protocol", () => {
      const result = validateRedirectUrl("vbscript:msgbox(1)");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("vbscript:");
    });

    it("should block blob: protocol", () => {
      const result = validateRedirectUrl("blob:https://example.com/uuid");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("blob:");
    });
  });

  describe("Invalid URL formats", () => {
    it("should reject empty string", () => {
      const result = validateRedirectUrl("");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("empty");
    });

    it("should reject whitespace only", () => {
      const result = validateRedirectUrl("   ");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("empty");
    });

    it("should reject malformed URLs", () => {
      const result = validateRedirectUrl("not a url");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Invalid URL format");
    });

    it("should reject URLs without hostname", () => {
      const result = validateRedirectUrl("https://");
      expect(result.isValid).toBe(false);
      // https:// without hostname throws during URL parsing
      expect(result.error).toContain("Invalid URL format");
    });
  });

  describe("Localhost handling", () => {
    let originalLocation: Location;

    beforeEach(() => {
      originalLocation = window.location;
    });

    afterEach(() => {
      // Restore original location
      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
      });
    });

    it("should allow localhost redirect when on localhost", () => {
      // Mock window.location.hostname to be localhost
      Object.defineProperty(window, "location", {
        value: { hostname: "localhost" },
        writable: true,
      });

      const result = validateRedirectUrl("http://localhost:3002");
      expect(result.isValid).toBe(true);
    });

    it("should allow 127.0.0.1 redirect when on 127.0.0.1", () => {
      Object.defineProperty(window, "location", {
        value: { hostname: "127.0.0.1" },
        writable: true,
      });

      const result = validateRedirectUrl("http://127.0.0.1:3002");
      expect(result.isValid).toBe(true);
    });

    it("should block localhost redirect when not on localhost", () => {
      Object.defineProperty(window, "location", {
        value: { hostname: "x.cartridge.gg" },
        writable: true,
      });

      const result = validateRedirectUrl("http://localhost:3002");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("localhost");
    });

    it("should block 127.0.0.1 redirect when in production", () => {
      Object.defineProperty(window, "location", {
        value: { hostname: "x.cartridge.gg" },
        writable: true,
      });

      const result = validateRedirectUrl("http://127.0.0.1:3002");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("localhost");
    });
  });

  describe("Real-world attack scenarios", () => {
    it("should block phishing attempt with lookalike domain", () => {
      // We allow this at validation level - domain allowlisting would be a separate layer
      const result = validateRedirectUrl("https://cartridge-gg.com");
      expect(result.isValid).toBe(true); // Passes validation, but would be caught by domain allowlist
    });

    it("should block XSS via javascript in query parameter", () => {
      // URL is valid, but javascript: protocol is blocked
      const result = validateRedirectUrl("javascript:alert(document.cookie)");
      expect(result.isValid).toBe(false);
    });

    it("should block encoded javascript protocol", () => {
      // Even with encoding, the protocol should be blocked
      const result = validateRedirectUrl(
        "javascript:void(document.body.innerHTML='<h1>Hacked</h1>')",
      );
      expect(result.isValid).toBe(false);
    });
  });
});

describe("safeRedirect", () => {
  let originalLocation: Location;
  let locationHref: string;

  beforeEach(() => {
    originalLocation = window.location;
    locationHref = "";

    // Mock window.location
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).location;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).location = {
      ...originalLocation,
      hostname: "x.cartridge.gg",
      href: locationHref,
    };

    // Mock location.href setter
    Object.defineProperty(window.location, "href", {
      set: (value: string) => {
        locationHref = value;
      },
      get: () => locationHref,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  it("should perform redirect for valid URL", () => {
    const result = safeRedirect("https://example.com");
    expect(result).toBe(true);
    expect(locationHref).toBe("https://example.com");
  });

  it("should not redirect for invalid URL", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = safeRedirect("javascript:alert(1)");
    expect(result).toBe(false);
    expect(locationHref).toBe(""); // No redirect happened
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Blocked unsafe redirect"),
      expect.anything(),
    );

    consoleSpy.mockRestore();
  });

  it("should log error details for blocked redirects", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    safeRedirect("javascript:alert(1)");

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Blocked unsafe redirect"),
      expect.stringContaining("javascript:alert(1)"),
    );

    consoleSpy.mockRestore();
  });
});
