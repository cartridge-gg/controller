import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  createExecuteUrl,
  parseControllerError,
  execute,
  normalizeCalls,
} from "./execute";
import { ResponseCodes } from "@cartridge/controller";
import { ErrorCode } from "@cartridge/controller-wasm/controller";
import { storeCallbacks, cleanupCallbacks } from "./callbacks";
import { Call } from "starknet";

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

// Mock window.controller
const mockController = {
  hasAuthorizedPoliciesForCalls: vi.fn(() => Promise.resolve(true)),
  executeFromOutsideV3: vi.fn(() =>
    Promise.resolve({ transaction_hash: "0x123" }),
  ),
  estimateInvokeFee: vi.fn(() => Promise.resolve({})),
  execute: vi.fn(() => Promise.resolve({ transaction_hash: "0x456" })),
};

describe("execute utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error - Mocking global
    global.window = { controller: mockController };
  });

  afterEach(() => {
    cleanupCallbacks("test-id");
  });

  describe("createExecuteUrl", () => {
    it("should create execute URL without callbacks", () => {
      const transactions: Call[] = [
        {
          contractAddress: "0x123",
          entrypoint: "transfer",
          calldata: ["0x456", "100", "0"],
        },
      ];

      const url = createExecuteUrl(transactions);

      expect(url).toMatch(/^\/execute\?data=/);

      // Decode and verify the data
      const dataParam = url.split("?data=")[1];
      const decoded = JSON.parse(decodeURIComponent(dataParam));

      expect(decoded).toEqual({
        id: "test-id",
        transactions,
      });
    });

    it("should create execute URL with callbacks", () => {
      const transactions: Call[] = [
        {
          contractAddress: "0x123",
          entrypoint: "transfer",
          calldata: ["0x456", "100", "0"],
        },
      ];

      const mockResolve = vi.fn();
      const mockReject = vi.fn();
      const mockOnCancel = vi.fn();

      const url = createExecuteUrl(transactions, {
        resolve: mockResolve,
        reject: mockReject,
        onCancel: mockOnCancel,
      });

      expect(storeCallbacks).toHaveBeenCalledWith("test-id", {
        resolve: mockResolve,
        reject: mockReject,
        onCancel: mockOnCancel,
      });

      expect(url).toMatch(/^\/execute\?data=/);
    });

    it("should create execute URL with error", () => {
      const transactions: Call[] = [];
      const error = {
        code: ErrorCode.InsufficientBalance,
        message: "Test error",
        data: {},
      };

      const url = createExecuteUrl(transactions, { error });

      const dataParam = url.split("?data=")[1];
      const decoded = JSON.parse(decodeURIComponent(dataParam));

      expect(decoded.error).toEqual(error);
    });
  });

  describe("parseControllerError", () => {
    it("should parse controller error with valid JSON data", () => {
      const controllerError = {
        code: ErrorCode.InsufficientBalance,
        message: "Test error",
        data: '{"execution_error": "Invalid transaction"}',
      };

      const result = parseControllerError(controllerError);

      expect(result).toEqual({
        code: ErrorCode.InsufficientBalance,
        message: "Test error",
        data: { execution_error: "Invalid transaction" },
      });
    });

    it("should handle controller error with invalid JSON data", () => {
      const controllerError = {
        code: ErrorCode.InsufficientBalance,
        message: "Test error",
        data: "invalid json",
      };

      const result = parseControllerError(controllerError);

      expect(result).toEqual({
        code: ErrorCode.InsufficientBalance,
        message: "Test error",
        data: { execution_error: "invalid json" },
      });
    });
  });

  describe("normalizeCalls", () => {
    it("should normalize single call", () => {
      const calls: Call[] = [
        {
          contractAddress: "0x123",
          entrypoint: "transfer",
          calldata: ["0x456", "100", "0"],
        },
      ];

      const result = normalizeCalls(calls);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        contractAddress: expect.stringMatching(/^0x/),
        entrypoint: "transfer",
        calldata: expect.any(Array),
      });
    });

    it("should normalize multiple calls", () => {
      const calls: Call[] = [
        {
          contractAddress: "0x123",
          entrypoint: "approve",
          calldata: ["0x456", "100", "0"],
        },
        {
          contractAddress: "0x789",
          entrypoint: "transfer",
          calldata: ["0xabc", "50", "0"],
        },
      ];

      const result = normalizeCalls(calls);

      expect(result).toHaveLength(2);
      expect(result[0].entrypoint).toBe("approve");
      expect(result[1].entrypoint).toBe("transfer");
    });
  });

  describe("execute function", () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
      mockNavigate.mockClear();
    });

    it("should handle sync execution", async () => {
      const executeFunc = execute({ navigate: mockNavigate });
      const transactions: Call[] = [
        {
          contractAddress: "0x123",
          entrypoint: "transfer",
          calldata: ["0x456", "100", "0"],
        },
      ];

      const promise = executeFunc(transactions, undefined, undefined, true);

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringMatching(/^\/execute\?data=/),
        { replace: true },
      );

      // The promise should be pending since sync mode waits for navigation
      expect(promise).toBeInstanceOf(Promise);
    });

    it("should handle authorized execution", async () => {
      const executeFunc = execute({ navigate: mockNavigate });
      const transactions: Call[] = [
        {
          contractAddress: "0x123",
          entrypoint: "transfer",
          calldata: ["0x456", "100", "0"],
        },
      ];

      mockController.hasAuthorizedPoliciesForCalls.mockResolvedValue(true);

      const result = await executeFunc(transactions);

      expect(result).toEqual({
        code: ResponseCodes.SUCCESS,
        transaction_hash: "0x123",
      });
    });

    it("should handle unauthorized execution", async () => {
      const executeFunc = execute({ navigate: mockNavigate });
      const transactions: Call[] = [
        {
          contractAddress: "0x123",
          entrypoint: "transfer",
          calldata: ["0x456", "100", "0"],
        },
      ];

      mockController.hasAuthorizedPoliciesForCalls.mockResolvedValue(false);

      const result = await executeFunc(transactions);

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringMatching(/^\/execute\?data=/),
        { replace: true },
      );

      expect(result).toEqual({
        code: ResponseCodes.USER_INTERACTION_REQUIRED,
        message: "User interaction required",
      });
    });

    it("should handle execution errors", async () => {
      const executeFunc = execute({ navigate: mockNavigate });
      const transactions: Call[] = [
        {
          contractAddress: "0x123",
          entrypoint: "transfer",
          calldata: ["0x456", "100", "0"],
        },
      ];

      mockController.hasAuthorizedPoliciesForCalls.mockResolvedValue(true);
      mockController.executeFromOutsideV3.mockRejectedValue({
        code: "EXECUTION_ERROR",
        message: "Transaction failed",
        data: "{}",
      });

      const result = await executeFunc(transactions);

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringMatching(/^\/execute\?data=/),
        { replace: true },
      );

      expect(result).toEqual({
        code: ResponseCodes.ERROR,
        message: "Transaction failed",
        error: expect.any(Object),
      });
    });

    it("should handle missing controller", async () => {
      // @ts-expect-error - Mocking global
      global.window = { controller: undefined };

      const executeFunc = execute({ navigate: mockNavigate });
      const transactions: Call[] = [];

      await expect(executeFunc(transactions)).rejects.toEqual({
        message: "Controller context not available",
      });
    });
  });
});
