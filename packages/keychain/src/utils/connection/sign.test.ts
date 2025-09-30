import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createSignMessageUrl,
  parseSignMessageParams,
  signMessageFactory,
} from "./sign";
import { ResponseCodes } from "@cartridge/controller";
import { storeCallbacks, cleanupCallbacks } from "./callbacks";
import { Signature, TypedData } from "starknet";

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

      expect(url).toMatch(/^\/sign-message\?data=/);

      // Decode and verify the data
      const dataParam = url.split("?data=")[1];
      const decoded = JSON.parse(decodeURIComponent(dataParam));

      expect(decoded).toEqual({
        id: "test-id",
        typedData: mockTypedData,
      });
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

      expect(url).toMatch(/^\/sign-message\?data=/);
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
  });

  describe("parseSignMessageParams", () => {
    it("should parse valid sign message params", () => {
      const params = {
        id: "test-id",
        typedData: mockTypedData,
      };

      const paramString = encodeURIComponent(JSON.stringify(params));
      const result = parseSignMessageParams(paramString);

      expect(result).toBeTruthy();
      expect(result?.params).toEqual(params);
    });

    it("should return null for invalid JSON", () => {
      const result = parseSignMessageParams("invalid-json");

      expect(result).toBeNull();
    });

    it("should wrap callbacks in new functions", () => {
      const mockResolve = vi.fn();
      const mockReject = vi.fn();
      const mockOnCancel = vi.fn();

      const params = {
        id: "test-id",
        typedData: mockTypedData,
      };

      // Store callbacks first
      storeCallbacks("test-id", {
        resolve: mockResolve,
        reject: mockReject,
        onCancel: mockOnCancel,
      });

      // Mock getCallbacks to return the stored callbacks
      vi.mocked(
        require("./callbacks").getCallbacks,
      ).mockReturnValue({
        resolve: mockResolve,
        reject: mockReject,
        onCancel: mockOnCancel,
      });

      const paramString = encodeURIComponent(JSON.stringify(params));
      const result = parseSignMessageParams(paramString);

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
      vi.mocked(require("./callbacks").getCallbacks).mockReturnValue(
        undefined,
      );

      const params = {
        id: "test-id",
        typedData: mockTypedData,
      };

      const paramString = encodeURIComponent(JSON.stringify(params));
      const result = parseSignMessageParams(paramString);

      expect(result?.resolve).toBeUndefined();
      expect(result?.reject).toBeUndefined();
      expect(result?.onCancel).toBeUndefined();
    });

    it("should handle params without id", () => {
      const params = {
        typedData: mockTypedData,
      };

      const paramString = encodeURIComponent(JSON.stringify(params));
      const result = parseSignMessageParams(paramString);

      expect(result?.resolve).toBeUndefined();
      expect(result?.reject).toBeUndefined();
      expect(result?.onCancel).toBeUndefined();
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
      global.window = { controller: mockController };
    });

    it("should navigate immediately when async is false", async () => {
      const signMessage = signMessageFactory({ navigate: mockNavigate });

      // Call without waiting since it creates a promise that resolves via callback
      const promise = signMessage(mockTypedData, "0x123", false);

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringMatching(/^\/sign-message\?data=/),
        { replace: true },
      );

      // Promise should be pending
      expect(promise).toBeInstanceOf(Promise);
    });

    it("should handle authorized message signing", async () => {
      const signMessage = signMessageFactory({ navigate: mockNavigate });
      const mockSignature: Signature = ["0x1", "0x2"];

      mockController.hasAuthorizedPoliciesForMessage.mockResolvedValue(true);
      mockController.signMessage.mockResolvedValue(mockSignature);

      const result = await signMessage(mockTypedData, "0x123", true);

      expect(result).toEqual(mockSignature);
      expect(mockController.signMessage).toHaveBeenCalledWith(mockTypedData);
    });

    it("should navigate when message is not authorized", async () => {
      const signMessage = signMessageFactory({ navigate: mockNavigate });

      mockController.hasAuthorizedPoliciesForMessage.mockResolvedValue(false);

      const result = await signMessage(mockTypedData, "0x123", true);

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringMatching(/^\/sign-message\?data=/),
        { replace: true },
      );

      expect(result).toEqual({
        code: ResponseCodes.USER_INTERACTION_REQUIRED,
        message: "User interaction required",
      });
    });

    it("should handle signing errors", async () => {
      const signMessage = signMessageFactory({ navigate: mockNavigate });
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

      const signMessage = signMessageFactory({ navigate: mockNavigate });

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

      expect(url).toMatch(/^\/sign-message\?data=/);

      // Extract data param and parse it
      const dataParam = url.split("?data=")[1];

      // Mock getCallbacks for parsing
      vi.mocked(require("./callbacks").getCallbacks).mockReturnValue({
        resolve: mockResolve,
      });

      const parsed = parseSignMessageParams(dataParam);

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