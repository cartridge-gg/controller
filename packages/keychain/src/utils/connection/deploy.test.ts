import { describe, expect, it, vi, beforeEach } from "vitest";
import { createDeployUrl, parseDeployParams, deployFactory } from "./deploy";
import { ResponseCodes } from "@cartridge/controller";
import { storeCallbacks, cleanupCallbacks } from "./callbacks";
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

describe("deploy utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createDeployUrl", () => {
    it("should create deploy URL without callbacks", () => {
      const account = "0x123456789";
      const url = createDeployUrl(account);

      expect(url).toMatch(/^\/deploy\?/);

      // Extract and verify the params
      const searchParams = new URLSearchParams(url.split("?")[1]);
      expect(searchParams.get("id")).toBe("test-id");
      expect(searchParams.get("account")).toBe(account);
    });

    it("should create deploy URL with callbacks", () => {
      const account = "0x123456789";
      const mockResolve = vi.fn();
      const mockReject = vi.fn();
      const mockOnCancel = vi.fn();

      const url = createDeployUrl(account, {
        resolve: mockResolve,
        reject: mockReject,
        onCancel: mockOnCancel,
      });

      expect(storeCallbacks).toHaveBeenCalledWith("test-id", {
        resolve: expect.any(Function),
        reject: mockReject,
        onCancel: mockOnCancel,
      });

      expect(url).toMatch(/^\/deploy\?/);
    });

    it("should wrap resolve callback to handle type casting", () => {
      const account = "0x123456789";
      const mockResolve = vi.fn();

      createDeployUrl(account, {
        resolve: mockResolve,
      });

      const storedCallbacks = (storeCallbacks as ReturnType<typeof vi.fn>).mock
        .calls[0][1];
      const wrappedResolve = storedCallbacks.resolve;

      // Test that the wrapped function calls the original
      const testResult = { hash: "0xdeployhash" };
      wrappedResolve(testResult);

      expect(mockResolve).toHaveBeenCalledWith(testResult);
    });

    it("should not store callbacks when none provided", () => {
      createDeployUrl("0x123", {});

      expect(storeCallbacks).not.toHaveBeenCalled();
    });
  });

  describe("parseDeployParams", () => {
    it("should parse valid deploy params", () => {
      const searchParams = new URLSearchParams();
      searchParams.set("id", "test-id");
      searchParams.set("account", "0x123456789");

      const result = parseDeployParams(searchParams);

      expect(result).toBeTruthy();
      expect(result?.params).toEqual({
        id: "test-id",
        account: "0x123456789",
      });
    });

    it("should return null for missing id", () => {
      const searchParams = new URLSearchParams();
      searchParams.set("account", "0x123456789");

      const result = parseDeployParams(searchParams);

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
      searchParams.set("account", "0x123456789");

      const result = parseDeployParams(searchParams);

      expect(result).toBeTruthy();
      expect(result?.resolve).toBeDefined();
      expect(result?.reject).toBeDefined();
      expect(result?.onCancel).toBeDefined();

      // Test that wrapped callbacks call originals
      const testResult = { hash: "0xdeployhash" };
      result?.resolve?.(testResult);
      expect(mockResolve).toHaveBeenCalledWith(testResult);

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
      searchParams.set("account", "0x123456789");

      const result = parseDeployParams(searchParams);

      expect(result?.resolve).toBeUndefined();
      expect(result?.reject).toBeUndefined();
      expect(result?.onCancel).toBeUndefined();
    });

    it("should handle params without id", () => {
      const searchParams = new URLSearchParams();
      searchParams.set("account", "0x123456789");

      const result = parseDeployParams(searchParams);

      expect(result).toBeNull();
    });
  });

  describe("deployFactory", () => {
    const mockNavigate = vi.fn();
    const mockController = {
      account: {
        isDeployed: vi.fn(),
      },
    };

    beforeEach(() => {
      mockNavigate.mockClear();
      // @ts-expect-error - Mocking global
      global.window = { controller: mockController };
    });

    it("should navigate to deploy route when account is not deployed", async () => {
      const deploy = deployFactory({ navigate: mockNavigate });

      mockController.account.isDeployed.mockResolvedValue(false);

      const result = await deploy("0x123456789");

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringMatching(/^\/deploy\?/),
        { replace: true },
      );

      expect(result).toEqual({
        code: ResponseCodes.USER_INTERACTION_REQUIRED,
        message: "User interaction required",
      });
    });

    it("should return success when account is already deployed", async () => {
      const deploy = deployFactory({ navigate: mockNavigate });

      mockController.account.isDeployed.mockResolvedValue(true);

      const result = await deploy("0x123456789");

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(result).toEqual({
        code: ResponseCodes.SUCCESS,
        message: "Account already deployed",
      });
    });

    it("should navigate when unable to check deployment status", async () => {
      const deploy = deployFactory({ navigate: mockNavigate });

      mockController.account.isDeployed.mockRejectedValue(
        new Error("Network error"),
      );

      const result = await deploy("0x123456789");

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringMatching(/^\/deploy\?/),
        { replace: true },
      );

      expect(result).toEqual({
        code: ResponseCodes.USER_INTERACTION_REQUIRED,
        message: "User interaction required",
      });
    });

    it("should reject when controller is not available", async () => {
      // @ts-expect-error - Mocking global
      global.window = { controller: undefined };

      const deploy = deployFactory({ navigate: mockNavigate });

      await expect(deploy("0x123456789")).rejects.toBe(
        "Controller not connected",
      );
    });

    it("should create URL with resolve and reject callbacks", async () => {
      const deploy = deployFactory({ navigate: mockNavigate });

      mockController.account.isDeployed.mockResolvedValue(false);

      await deploy("0x123456789");

      expect(storeCallbacks).toHaveBeenCalledWith("test-id", {
        resolve: expect.any(Function),
        reject: expect.any(Function),
      });
    });
  });

  describe("integration", () => {
    it("should handle complete deploy lifecycle", () => {
      // Create URL with callbacks
      const mockResolve = vi.fn();
      const account = "0x123456789";
      const url = createDeployUrl(account, {
        resolve: mockResolve,
      });

      expect(url).toMatch(/^\/deploy\?/);

      // Extract search params from URL
      const searchParams = new URLSearchParams(url.split("?")[1]);

      // Mock getCallbacks for parsing
      vi.mocked(callbacksModule.getCallbacks).mockReturnValue({
        resolve: mockResolve,
      });

      const parsed = parseDeployParams(searchParams);

      expect(parsed).toBeTruthy();
      expect(parsed?.params.account).toEqual(account);

      // Simulate deployment completion
      const deployResult = { hash: "0xdeployhash123" };
      parsed?.resolve?.(deployResult);

      expect(mockResolve).toHaveBeenCalledWith(deployResult);

      // Cleanup
      cleanupCallbacks(parsed!.params.id);
    });

    it("should handle deploy cancellation", () => {
      const mockResolve = vi.fn();
      const mockOnCancel = vi.fn();
      const account = "0x123456789";

      const url = createDeployUrl(account, {
        resolve: mockResolve,
        onCancel: mockOnCancel,
      });

      // Extract search params from URL
      const searchParams = new URLSearchParams(url.split("?")[1]);

      vi.mocked(callbacksModule.getCallbacks).mockReturnValue({
        resolve: mockResolve,
        onCancel: mockOnCancel,
      });

      const parsed = parseDeployParams(searchParams);

      // Simulate user cancelling
      parsed?.onCancel?.();

      expect(mockOnCancel).toHaveBeenCalled();
      expect(mockResolve).not.toHaveBeenCalled();

      // Cleanup
      cleanupCallbacks(parsed!.params.id);
    });
  });
});
