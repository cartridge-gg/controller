import { describe, it, expect } from "vitest";
import { isTrustedOrigin, parseToastEvent } from "./validation";
import { CONTROLLER_TOAST_MESSAGE_TYPE } from "../types";

describe("isTrustedOrigin", () => {
  describe("accepted origins", () => {
    it("accepts localhost on any port", () => {
      expect(isTrustedOrigin("http://localhost:3001")).toBe(true);
      expect(isTrustedOrigin("http://localhost:3002")).toBe(true);
      expect(isTrustedOrigin("https://localhost")).toBe(true);
      expect(isTrustedOrigin("http://127.0.0.1:3001")).toBe(true);
    });

    it("accepts the production keychain origin", () => {
      expect(isTrustedOrigin("https://x.cartridge.gg")).toBe(true);
    });

    it("accepts any cartridge.gg subdomain over https", () => {
      expect(isTrustedOrigin("https://profile.cartridge.gg")).toBe(true);
      expect(isTrustedOrigin("https://deep.nested.cartridge.gg")).toBe(true);
      expect(isTrustedOrigin("https://cartridge.gg")).toBe(true);
    });
  });

  describe("rejected origins", () => {
    it("rejects sibling tenants on shared hosts", () => {
      expect(isTrustedOrigin("https://evil.vercel.app")).toBe(false);
      expect(isTrustedOrigin("https://evil.github.io")).toBe(false);
      expect(isTrustedOrigin("https://evil.pages.dev")).toBe(false);
      expect(isTrustedOrigin("https://evil.co.uk")).toBe(false);
    });

    it("rejects arbitrary third-party origins", () => {
      expect(isTrustedOrigin("https://example.com")).toBe(false);
      expect(isTrustedOrigin("https://cartridge.gg.evil.com")).toBe(false);
    });

    it("rejects lookalike domains that only end with the string", () => {
      expect(isTrustedOrigin("https://evilcartridge.gg")).toBe(false);
    });

    it("rejects cartridge.gg over plain http", () => {
      expect(isTrustedOrigin("http://x.cartridge.gg")).toBe(false);
    });

    it("rejects opaque and malformed origins", () => {
      expect(isTrustedOrigin("null")).toBe(false);
      expect(isTrustedOrigin("")).toBe(false);
      expect(isTrustedOrigin("not a url")).toBe(false);
    });
  });
});

describe("parseToastEvent", () => {
  const options = { variant: "error", message: "boom" };

  it("returns options for a well-formed toast message", () => {
    expect(
      parseToastEvent({ type: CONTROLLER_TOAST_MESSAGE_TYPE, options }),
    ).toEqual(options);
  });

  it("ignores messages of other types", () => {
    expect(parseToastEvent({ type: "something-else", options })).toBeNull();
  });

  it("ignores non-object data", () => {
    expect(parseToastEvent(null)).toBeNull();
    expect(parseToastEvent(undefined)).toBeNull();
    expect(parseToastEvent("controller-toast")).toBeNull();
    expect(parseToastEvent(42)).toBeNull();
  });

  it("ignores malformed options instead of throwing", () => {
    expect(
      parseToastEvent({ type: CONTROLLER_TOAST_MESSAGE_TYPE, options: null }),
    ).toBeNull();
    expect(
      parseToastEvent({ type: CONTROLLER_TOAST_MESSAGE_TYPE, options: "hi" }),
    ).toBeNull();
    expect(
      parseToastEvent({ type: CONTROLLER_TOAST_MESSAGE_TYPE, options: {} }),
    ).toBeNull();
    expect(
      parseToastEvent({
        type: CONTROLLER_TOAST_MESSAGE_TYPE,
        options: { variant: 42 },
      }),
    ).toBeNull();
  });

  it("ignores messages missing type or options", () => {
    expect(parseToastEvent({ options })).toBeNull();
    expect(parseToastEvent({ type: CONTROLLER_TOAST_MESSAGE_TYPE })).toBeNull();
  });
});
