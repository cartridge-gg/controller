import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./callbacks", () => ({
  generateCallbackId: vi.fn(() => "test-id"),
  storeCallbacks: vi.fn(),
  getCallbacks: vi.fn(),
}));

import type {
  AuthOptions,
  ConnectError,
  ConnectOptions,
  ConnectReply,
} from "@cartridge/controller";
import { ResponseCodes } from "@cartridge/controller";
import { SemVer } from "semver";
import {
  createConnectReply,
  createConnectUrl,
  parseConnectParams,
  shouldContinueConnectOnboarding,
  connect,
  supportsConnectKeepOpen,
} from "./connect";
import { getCallbacks, storeCallbacks } from "./callbacks";

describe("connect utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createConnectUrl", () => {
    it("creates a URL with just an id when no signup options are provided", () => {
      const { url } = createConnectUrl(undefined);
      expect(url).toBe("/connect?id=test-id");
      expect(storeCallbacks).not.toHaveBeenCalled();
    });

    it("stores callbacks and encodes signup options", () => {
      const resolve = vi.fn();
      const signers: AuthOptions = ["webauthn"];
      const { url } = createConnectUrl(signers, { resolve });

      expect(storeCallbacks).toHaveBeenCalledTimes(1);
      expect(url).toMatch(/^\/connect\?/);

      const searchParams = new URLSearchParams(url.split("?")[1]);
      expect(searchParams.get("id")).toBe("test-id");
      expect(searchParams.get("signers")).toBe(JSON.stringify(signers));
    });
  });

  describe("keepOpen version gate", () => {
    it("keeps onboarding out of the published 0.13.12 iframe", () => {
      expect(supportsConnectKeepOpen(new SemVer("0.13.12"), false)).toBe(false);
      expect(createConnectReply("0xabc", false, false)).toEqual({
        code: ResponseCodes.SUCCESS,
        address: "0xabc",
      });
      expect(shouldContinueConnectOnboarding(true, false, "/connect")).toBe(
        false,
      );
    });

    it("enables additive keepOpen behavior from 0.13.13 onward", () => {
      expect(supportsConnectKeepOpen(new SemVer("0.13.13"), false)).toBe(true);
      expect(supportsConnectKeepOpen(new SemVer("0.14.0-alpha.1"), false)).toBe(
        true,
      );
      expect(createConnectReply("0xabc", true, true)).toEqual({
        code: ResponseCodes.SUCCESS,
        address: "0xabc",
        keepOpen: true,
      });
      expect(shouldContinueConnectOnboarding(true, true, "/connect")).toBe(
        true,
      );
      expect(shouldContinueConnectOnboarding(true, true, "/session")).toBe(
        false,
      );
    });

    it("uses current onboarding behavior in standalone mode", () => {
      expect(supportsConnectKeepOpen(undefined, true)).toBe(true);
      expect(supportsConnectKeepOpen(undefined, false)).toBe(false);
    });
  });

  describe("parseConnectParams", () => {
    it("parses signers from a JSON array", () => {
      vi.mocked(getCallbacks).mockReturnValue(undefined);

      const searchParams = new URLSearchParams();
      searchParams.set("id", "test-id");
      searchParams.set("signers", JSON.stringify(["webauthn"]));

      const parsed = parseConnectParams(searchParams);
      expect(parsed?.params.signers).toEqual(["webauthn"]);
    });

    it("parses signupOptions from a JSON object payload", () => {
      vi.mocked(getCallbacks).mockReturnValue(undefined);

      const searchParams = new URLSearchParams();
      searchParams.set("id", "test-id");
      searchParams.set(
        "signers",
        JSON.stringify({
          signupOptions: ["webauthn"],
        } satisfies ConnectOptions),
      );

      const parsed = parseConnectParams(searchParams);
      expect(parsed?.params.signers).toEqual(["webauthn"]);
    });

    it("wraps resolve to validate connect result type", () => {
      const reject = vi.fn();
      const resolve = vi.fn();

      vi.mocked(getCallbacks).mockReturnValue({
        resolve: resolve as unknown as (result: unknown) => void,
        reject: reject as unknown as (error: unknown) => void,
      });

      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {
        // suppressed
      });

      const searchParams = new URLSearchParams();
      searchParams.set("id", "test-id");
      const parsed = parseConnectParams(searchParams);
      expect(parsed).toBeTruthy();

      // Invalid shape should reject.
      parsed?.resolve?.({ not: "a connect result" });
      expect(reject).toHaveBeenCalledTimes(1);

      // Valid reply should resolve.
      const ok: ConnectReply = {
        code: ResponseCodes.SUCCESS,
        address: "0xabc",
      };
      parsed?.resolve?.(ok);
      expect(resolve).toHaveBeenCalledWith(ok);

      consoleError.mockRestore();
    });
  });

  describe("connect()", () => {
    it("throws when signup options are an empty array", () => {
      const navigate = vi.fn();
      const setRpcUrl = vi.fn();
      const connectFn = connect({ navigate, setRpcUrl })();
      expect(() => connectFn({ signupOptions: [] })).toThrow(
        /signup options cannot be empty/i,
      );
    });

    it("navigates and resolves when callbacks resolve with an address", async () => {
      const navigate = vi.fn();
      const setRpcUrl = vi.fn();
      const connectFn = connect({ navigate, setRpcUrl })();

      const promise = connectFn({ signupOptions: ["webauthn"] });
      expect(navigate).toHaveBeenCalledWith(
        expect.stringMatching(/^\/connect\?/),
        { replace: true },
      );

      const callbacks = vi.mocked(storeCallbacks).mock.calls[0][1] as {
        resolve?: (result: ConnectReply | ConnectError) => void;
      };
      callbacks.resolve?.({ code: ResponseCodes.SUCCESS, address: "0xabc" });

      await expect(promise).resolves.toEqual({
        code: ResponseCodes.SUCCESS,
        address: "0xabc",
      });
    });

    it("keeps the Controller 0.13.12 positional connect signature", () => {
      const navigate = vi.fn();
      const setRpcUrl = vi.fn();
      const connectFn = connect({ navigate, setRpcUrl })();
      const policies = {
        contracts: {
          "0x123": {
            methods: [{ entrypoint: "transfer" }],
          },
        },
      };

      void connectFn(policies, "https://rpc.example.com", ["webauthn"]);

      expect(setRpcUrl).toHaveBeenCalledWith("https://rpc.example.com");
      const url = vi.mocked(navigate).mock.calls[0][0] as string;
      const searchParams = new URLSearchParams(url.split("?")[1]);
      expect(searchParams.get("signers")).toBe(JSON.stringify(["webauthn"]));
    });

    it("keeps the current ConnectOptions object signature", () => {
      const navigate = vi.fn();
      const setRpcUrl = vi.fn();
      const connectFn = connect({ navigate, setRpcUrl })();

      void connectFn({ signupOptions: ["password"] });

      expect(setRpcUrl).not.toHaveBeenCalled();
      const url = vi.mocked(navigate).mock.calls[0][0] as string;
      const searchParams = new URLSearchParams(url.split("?")[1]);
      expect(searchParams.get("signers")).toBe(JSON.stringify(["password"]));
    });
  });
});
