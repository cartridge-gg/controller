import { describe, expect, it } from "vitest";
import { parseTrustedAuthContext } from "./popup";

const KEYCHAIN_ORIGIN = "https://x.cartridge.gg";
const CHANNEL = "channel-123";

// Stand-in window references; parseTrustedAuthContext only compares identity.
const opener = {} as Window;
const other = {} as Window;

function authContextEvent(
  overrides: Partial<MessageEvent> & { data?: unknown } = {},
): MessageEvent {
  return {
    origin: KEYCHAIN_ORIGIN,
    source: opener,
    data: {
      type: "auth-context",
      channelId: CHANNEL,
      origin: "https://www.deathmountain.gg",
    },
    ...overrides,
  } as MessageEvent;
}

describe("parseTrustedAuthContext", () => {
  const opts = {
    channelId: CHANNEL,
    expectedOrigin: KEYCHAIN_ORIGIN,
    opener,
  };

  it("accepts a trusted auth-context from the opener and returns its origin", () => {
    expect(parseTrustedAuthContext(authContextEvent(), opts)).toBe(
      "https://www.deathmountain.gg",
    );
  });

  it("rejects a message from a cross-origin sender", () => {
    // A page that opens /auth directly is cross-origin; its messages must not be
    // trusted to supply the app origin.
    expect(
      parseTrustedAuthContext(
        authContextEvent({ origin: "https://evil.com" }),
        opts,
      ),
    ).toBeNull();
  });

  it("rejects a message whose source is not the opener", () => {
    expect(
      parseTrustedAuthContext(authContextEvent({ source: other }), opts),
    ).toBeNull();
  });

  it("rejects a message for a different channel", () => {
    expect(
      parseTrustedAuthContext(
        authContextEvent({
          data: {
            type: "auth-context",
            channelId: "other-channel",
            origin: "https://www.deathmountain.gg",
          },
        }),
        opts,
      ),
    ).toBeNull();
  });

  it("rejects a message of the wrong type", () => {
    expect(
      parseTrustedAuthContext(
        authContextEvent({
          data: { type: "auth-ack", channelId: CHANNEL },
        }),
        opts,
      ),
    ).toBeNull();
  });

  it("rejects a message with a missing or empty origin", () => {
    expect(
      parseTrustedAuthContext(
        authContextEvent({
          data: { type: "auth-context", channelId: CHANNEL, origin: "" },
        }),
        opts,
      ),
    ).toBeNull();
  });

  it("rejects when there is no opener", () => {
    expect(
      parseTrustedAuthContext(authContextEvent(), { ...opts, opener: null }),
    ).toBeNull();
  });
});
