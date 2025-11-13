import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createSignMessageUrl,
  parseSignMessageParams,
  signMessageFactory,
} from "./sign";
import { ResponseCodes } from "@cartridge/controller";
import { storeCallbacks, cleanupCallbacks } from "./callbacks";
import { Signature, TypedData } from "starknet";
import * as callbacksModule from "./callbacks";

// Mock the callbacks module
vi.mock("./callbacks", () => ({
  storeCallbacks: vi.fn(),
  getCallbacks: vi.fn(() => ({})),
  generateCallbackId: vi.fn(() => "test-id"),
  cleanupCallbacks: vi.fn(),
}));

// Mock the mutex module
vi.mock("./sync", () => ({
  mutex: {
    obtain: vi.fn(() => Promise.resolve(() => {})),
  },
}));

const mockTypedData: TypedData = {
  types: {
    StarkNetDomain: [
      { name: "name", type: "felt" },
      { name: "chainId", type: "felt" },
      { name: "version", type: "felt" },
    ],
    Message: [
      { name: "content", type: "felt" },
      { name: "sender", type: "felt" },
    ],
  },
  primaryType: "Message",
  domain: {
    name: "Test",
    chainId: "1",
    version: "1",
  },
  message: {
    content: "Hello",
    sender: "0x123",
  },
};

describe("sign message utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createSignMessageUrl", () => {
    it("should create sign message URL without callbacks", () => {
      const url = createSignMessageUrl(mockTypedData);

      expect(url).toMatch(/^\/sign-message\?/);

      // Decode and verify the params
      const searchParams = new URLSearchParams(url.split("?")[1]);
      expect(searchParams.get("id")).toBe("test-id");
      const typedDataParam = searchParams.get("typedData");
      expect(typedDataParam).toBeTruthy();
      const decoded = JSON.parse(decodeURIComponent(typedDataParam!));
      expect(decoded).toEqual(mockTypedData);
    });

    it("should create sign message URL with callbacks", () => {
      const mockResolve = vi.fn();
      const mockReject = vi.fn();
      const mockOnCancel = vi.fn();

      const url = createSignMessageUrl(mockTypedData, {
        resolve: mockResolve,
        reject: mockReject,
        onCancel: mockOnCancel,
      });

      expect(storeCallbacks).toHaveBeenCalledWith("test-id", {
        resolve: expect.any(Function),
        reject: mockReject,
        onCancel: mockOnCancel,
      });

      expect(url).toMatch(/^\/sign-message\?/);
    });

    it("should wrap resolve callback to handle type casting", () => {
      const mockResolve = vi.fn();

      createSignMessageUrl(mockTypedData, {
        resolve: mockResolve,
      });

      const storedCallbacks = (storeCallbacks as ReturnType<typeof vi.fn>).mock
        .calls[0][1];
      const wrappedResolve = storedCallbacks.resolve;

      // Test that the wrapped function calls the original
      const testSignature: Signature = ["0x1", "0x2"];
      wrappedResolve(testSignature);

      expect(mockResolve).toHaveBeenCalledWith(testSignature);
    });

    it("should not store callbacks when none provided", () => {
      createSignMessageUrl(mockTypedData, {});

      expect(storeCallbacks).not.toHaveBeenCalled();
    });

    it("should serialize BigInt values in typedData message", () => {
      const typedDataWithBigInt: TypedData = {
        ...mockTypedData,
        message: {
          amount: BigInt("1000000000000000000"), // 1 ETH in wei as BigInt
          recipient: "0x456",
        },
      };

      // This should not throw
      const url = createSignMessageUrl(typedDataWithBigInt);

      expect(url).toMatch(/^\/sign-message\?/);

      // Decode and verify the data
      const searchParams = new URLSearchParams(url.split("?")[1]);
      const typedDataParam = searchParams.get("typedData");
      expect(typedDataParam).toBeTruthy();
      const decoded = JSON.parse(decodeURIComponent(typedDataParam!));

      expect(decoded.message).toEqual({
        amount: "1000000000000000000",
        recipient: "0x456",
      });
    });

    it("should serialize mixed BigInt and other values in typedData", () => {
      const typedDataWithMixed: TypedData = {
        ...mockTypedData,
        message: {
          value1: BigInt("999999999999999999999"),
          value2: "regular_string",
          value3: BigInt(42),
          value4: 123,
          value5: "0x789",
        },
      };

      const url = createSignMessageUrl(typedDataWithMixed);

      const searchParams = new URLSearchParams(url.split("?")[1]);
      const typedDataParam = searchParams.get("typedData");
      expect(typedDataParam).toBeTruthy();
      const decoded = JSON.parse(decodeURIComponent(typedDataParam!));

      expect(decoded.message).toEqual({
        value1: "999999999999999999999",
        value2: "regular_string",
        value3: "42",
        value4: 123,
        value5: "0x789",
      });
    });
  });

  describe("parseSignMessageParams", () => {
    it("should parse valid sign message params", () => {
      const searchParams = new URLSearchParams();
      searchParams.set("id", "test-id");
      searchParams.set(
        "typedData",
        encodeURIComponent(JSON.stringify(mockTypedData)),
      );

      const result = parseSignMessageParams(searchParams);

      expect(result).toBeTruthy();
      expect(result?.params).toEqual({
        id: "test-id",
        typedData: mockTypedData,
      });
    });

    it("should return null for missing id", () => {
      const searchParams = new URLSearchParams();
      searchParams.set(
        "typedData",
        encodeURIComponent(JSON.stringify(mockTypedData)),
      );

      const result = parseSignMessageParams(searchParams);

      expect(result).toBeNull();
    });

    it("should wrap callbacks in new functions", () => {
      const mockResolve = vi.fn();
      const mockReject = vi.fn();
      const mockOnCancel = vi.fn();

      // Store callbacks first
      storeCallbacks("test-id", {
        resolve: mockResolve,
        reject: mockReject,
        onCancel: mockOnCancel,
      });

      // Mock getCallbacks to return the stored callbacks
      vi.mocked(callbacksModule.getCallbacks).mockReturnValue({
        resolve: mockResolve,
        reject: mockReject,
        onCancel: mockOnCancel,
      });

      const searchParams = new URLSearchParams();
      searchParams.set("id", "test-id");
      searchParams.set(
        "typedData",
        encodeURIComponent(JSON.stringify(mockTypedData)),
      );

      const result = parseSignMessageParams(searchParams);

      expect(result).toBeTruthy();
      expect(result?.resolve).toBeDefined();
      expect(result?.reject).toBeDefined();
      expect(result?.onCancel).toBeDefined();

      // Test that wrapped callbacks call originals
      const testSignature: Signature = ["0x1", "0x2"];
      result?.resolve?.(testSignature);
      expect(mockResolve).toHaveBeenCalledWith(testSignature);

      const testError = new Error("test");
      result?.reject?.(testError);
      expect(mockReject).toHaveBeenCalledWith(testError);

      result?.onCancel?.();
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it("should return undefined callbacks when no callbacks stored", () => {
      vi.mocked(callbacksModule.getCallbacks).mockReturnValue(undefined);

      const searchParams = new URLSearchParams();
      searchParams.set("id", "test-id");
      searchParams.set(
        "typedData",
        encodeURIComponent(JSON.stringify(mockTypedData)),
      );

      const result = parseSignMessageParams(searchParams);

      expect(result?.resolve).toBeUndefined();
      expect(result?.reject).toBeUndefined();
      expect(result?.onCancel).toBeUndefined();
    });

    it("should handle params without id", () => {
      const searchParams = new URLSearchParams();
      searchParams.set(
        "typedData",
        encodeURIComponent(JSON.stringify(mockTypedData)),
      );

      const result = parseSignMessageParams(searchParams);

      expect(result).toBeNull();
    });
  });

  describe("signMessageFactory", () => {
    const mockNavigate = vi.fn();
    const mockController = {
      hasAuthorizedPoliciesForMessage: vi.fn(),
      signMessage: vi.fn(),
    };

    beforeEach(() => {
      mockNavigate.mockClear();
      // @ts-expect-error - Mocking global
      global.window = {
        controller: mockController,
      };
    });

    it("should navigate immediately when async is false", async () => {
      const signMessage = signMessageFactory({ navigate: mockNavigate })(
        "https://example.com",
      );

      // Call without waiting since it creates a promise that resolves via callback
      const promise = signMessage(mockTypedData, "0x123", false);

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringMatching(/^\/sign-message\?/),
        { replace: true },
      );

      // Promise should be pending
      expect(promise).toBeInstanceOf(Promise);
    });

    it("should handle authorized message signing", async () => {
      const signMessage = signMessageFactory({ navigate: mockNavigate })(
        "https://example.com",
      );
      const mockSignature: Signature = ["0x1", "0x2"];

      mockController.hasAuthorizedPoliciesForMessage.mockResolvedValue(true);
      mockController.signMessage.mockResolvedValue(mockSignature);

      const result = await signMessage(mockTypedData, "0x123", true);

      expect(result).toEqual(mockSignature);
      expect(mockController.signMessage).toHaveBeenCalledWith(mockTypedData);
    });

    it("should navigate when message is not authorized", async () => {
      const signMessage = signMessageFactory({ navigate: mockNavigate })(
        "https://example.com",
      );

      mockController.hasAuthorizedPoliciesForMessage.mockResolvedValue(false);

      const result = await signMessage(mockTypedData, "0x123", true);

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringMatching(/^\/sign-message\?/),
        { replace: true },
      );

      expect(result).toEqual({
        code: ResponseCodes.USER_INTERACTION_REQUIRED,
        message: "User interaction required",
      });
    });

    it("should handle signing errors", async () => {
      const signMessage = signMessageFactory({ navigate: mockNavigate })(
        "https://example.com",
      );
      const error = new Error("Signing failed");

      mockController.hasAuthorizedPoliciesForMessage.mockResolvedValue(true);
      mockController.signMessage.mockRejectedValue(error);

      const result = await signMessage(mockTypedData, "0x123", true);

      expect(result).toEqual({
        code: ResponseCodes.ERROR,
        message: "Signing failed",
        error: expect.any(Object),
      });
    });

    it("should reject when controller is not available", async () => {
      // @ts-expect-error - Mocking global
      global.window = { controller: undefined };

      const signMessage = signMessageFactory({ navigate: mockNavigate })(
        "https://example.com",
      );

      await expect(signMessage(mockTypedData, "0x123", true)).rejects.toBe(
        "Controller not connected",
      );
    });
  });

  describe("integration", () => {
    it("should handle complete sign message lifecycle", () => {
      // Create URL with callbacks
      const mockResolve = vi.fn();
      const url = createSignMessageUrl(mockTypedData, {
        resolve: mockResolve,
      });

      expect(url).toMatch(/^\/sign-message\?/);

      // Extract search params from URL
      const searchParams = new URLSearchParams(url.split("?")[1]);

      // Mock getCallbacks for parsing
      vi.mocked(callbacksModule.getCallbacks).mockReturnValue({
        resolve: mockResolve,
      });

      const parsed = parseSignMessageParams(searchParams);

      expect(parsed).toBeTruthy();
      expect(parsed?.params.typedData).toEqual(mockTypedData);

      // Simulate signing
      const signature: Signature = ["0x1", "0x2"];
      parsed?.resolve?.(signature);

      expect(mockResolve).toHaveBeenCalledWith(signature);

      // Cleanup
      cleanupCallbacks(parsed!.params.id);
    });
  });
});
