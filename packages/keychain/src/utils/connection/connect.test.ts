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
import { createConnectUrl, parseConnectParams, connect } from "./connect";
import { getCallbacks, storeCallbacks } from "./callbacks";

describe("connect utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createConnectUrl", () => {
    it("creates a URL with just an id when no signup options are provided", () => {
      const url = createConnectUrl(undefined);
      expect(url).toBe("/connect?id=test-id");
      expect(storeCallbacks).not.toHaveBeenCalled();
    });

    it("stores callbacks and encodes signup options", () => {
      const resolve = vi.fn();
      const signers: AuthOptions = ["webauthn"];
      const url = createConnectUrl(signers, { resolve });

      expect(storeCallbacks).toHaveBeenCalledTimes(1);
      expect(url).toMatch(/^\/connect\?/);

      const searchParams = new URLSearchParams(url.split("?")[1]);
      expect(searchParams.get("id")).toBe("test-id");
      expect(searchParams.get("signers")).toBe(JSON.stringify(signers));
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
  });
});
