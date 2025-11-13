import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  createExecuteUrl,
  parseControllerError,
  execute,
  normalizeCalls,
} from "./execute";
import { ResponseCodes } from "@cartridge/controller";
import { ErrorCode } from "@cartridge/controller-wasm";
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
  trySessionExecute: vi.fn(() =>
    Promise.resolve({ transaction_hash: "0x123" }),
  ),
};

describe("execute utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error - Mocking global
    global.window = {
      controller: mockController,
    };
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

      expect(url).toMatch(/^\/execute\?/);

      // Decode and verify the params
      const searchParams = new URLSearchParams(url.split("?")[1]);
      expect(searchParams.get("id")).toBe("test-id");
      const transactionsParam = searchParams.get("transactions");
      expect(transactionsParam).toBeTruthy();
      const decoded = JSON.parse(decodeURIComponent(transactionsParam!));
      expect(decoded).toEqual(transactions);
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

      expect(url).toMatch(/^\/execute\?/);
    });

    it("should create execute URL with error", () => {
      const transactions: Call[] = [];
      const error = {
        code: ErrorCode.InsufficientBalance,
        message: "Test error",
        data: {},
      };

      const url = createExecuteUrl(transactions, { error });

      const searchParams = new URLSearchParams(url.split("?")[1]);
      const errorParam = searchParams.get("error");
      expect(errorParam).toBeTruthy();
      const decoded = JSON.parse(decodeURIComponent(errorParam!));

      expect(decoded).toEqual(error);
    });

    it("should serialize BigInt values in calldata", () => {
      const transactions: Call[] = [
        {
          contractAddress: "0x123",
          entrypoint: "transfer",
          calldata: [
            "0x456",
            BigInt("1000000000000000000"), // 1 ETH in wei as BigInt
            BigInt(0),
          ],
        },
      ];

      // This should not throw
      const url = createExecuteUrl(transactions);

      expect(url).toMatch(/^\/execute\?/);

      // Decode and verify the data
      const searchParams = new URLSearchParams(url.split("?")[1]);
      const transactionsParam = searchParams.get("transactions");
      expect(transactionsParam).toBeTruthy();
      const decoded = JSON.parse(decodeURIComponent(transactionsParam!));

      expect(decoded[0].calldata).toEqual([
        "0x456",
        "1000000000000000000",
        "0",
      ]);
    });

    it("should serialize mixed BigInt and string calldata", () => {
      const transactions: Call[] = [
        {
          contractAddress: "0x123",
          entrypoint: "complex_call",
          calldata: [
            "0x456",
            BigInt("999999999999999999999"),
            "regular_string",
            BigInt(42),
            "0x789",
          ],
        },
      ];

      const url = createExecuteUrl(transactions);

      const searchParams = new URLSearchParams(url.split("?")[1]);
      const transactionsParam = searchParams.get("transactions");
      expect(transactionsParam).toBeTruthy();
      const decoded = JSON.parse(decodeURIComponent(transactionsParam!));

      expect(decoded[0].calldata).toEqual([
        "0x456",
        "999999999999999999999",
        "regular_string",
        "42",
        "0x789",
      ]);
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

  describe("session and manual execution error handling", () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should handle SessionRefreshRequired error from trySessionExecute", async () => {
      const executeFunc = execute({ navigate: mockNavigate })(
        "https://example.com",
      );
      const transactions: Call[] = [
        {
          contractAddress: "0x123",
          entrypoint: "transfer",
          calldata: ["0x456", "100", "0"],
        },
      ];

      // Simulate SessionRefreshRequired error
      mockController.trySessionExecute.mockRejectedValue({
        code: ErrorCode.SessionRefreshRequired,
        message: "Session needs to be refreshed",
        data: "{}",
      });

      const result = await executeFunc(transactions);

      // Should navigate to UI for session refresh
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringMatching(/^\/execute\?/),
        { replace: true },
      );

      // Parse the URL to verify error is included
      const urlCall = mockNavigate.mock.calls[0][0];
      const searchParams = new URLSearchParams(urlCall.split("?")[1]);
      const errorParam = searchParams.get("error");
      expect(errorParam).toBeTruthy();
      const decoded = JSON.parse(decodeURIComponent(errorParam!));
      expect(decoded).toMatchObject({
        code: ErrorCode.SessionRefreshRequired,
        message: "Session needs to be refreshed",
      });

      expect(result).toEqual({
        code: ResponseCodes.USER_INTERACTION_REQUIRED,
        message: "User interaction required",
      });
    });

    it("should handle ManualExecutionRequired error from trySessionExecute", async () => {
      const executeFunc = execute({ navigate: mockNavigate })(
        "https://example.com",
      );
      const transactions: Call[] = [
        {
          contractAddress: "0x123",
          entrypoint: "transfer",
          calldata: ["0x456", "100", "0"],
        },
      ];

      // Simulate ManualExecutionRequired error
      mockController.trySessionExecute.mockRejectedValue({
        code: ErrorCode.ManualExecutionRequired,
        message: "Manual execution required",
        data: "{}",
      });

      const result = await executeFunc(transactions);

      // Should navigate to UI for manual execution
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringMatching(/^\/execute\?/),
        { replace: true },
      );

      // Parse the URL to verify error is included
      const urlCall = mockNavigate.mock.calls[0][0];
      const searchParams = new URLSearchParams(urlCall.split("?")[1]);
      const errorParam = searchParams.get("error");
      expect(errorParam).toBeTruthy();
      const decoded = JSON.parse(decodeURIComponent(errorParam!));
      expect(decoded).toMatchObject({
        code: ErrorCode.ManualExecutionRequired,
        message: "Manual execution required",
      });

      expect(result).toEqual({
        code: ResponseCodes.USER_INTERACTION_REQUIRED,
        message: "User interaction required",
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
      const executeFunc = execute({ navigate: mockNavigate })(
        "https://example.com",
      );
      const transactions: Call[] = [
        {
          contractAddress: "0x123",
          entrypoint: "transfer",
          calldata: ["0x456", "100", "0"],
        },
      ];

      const promise = executeFunc(transactions, undefined, undefined, true);

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringMatching(/^\/execute\?/),
        { replace: true },
      );

      // The promise should be pending since sync mode waits for navigation
      expect(promise).toBeInstanceOf(Promise);
    });

    it("should handle authorized execution", async () => {
      const executeFunc = execute({ navigate: mockNavigate })(
        "https://example.com",
      );
      const transactions: Call[] = [
        {
          contractAddress: "0x123",
          entrypoint: "transfer",
          calldata: ["0x456", "100", "0"],
        },
      ];

      // trySessionExecute handles authorization internally
      mockController.trySessionExecute.mockResolvedValue({
        transaction_hash: "0x123",
      });

      const result = await executeFunc(transactions);

      expect(result).toEqual({
        code: ResponseCodes.SUCCESS,
        transaction_hash: "0x123",
      });
    });

    it("should handle unauthorized execution", async () => {
      const executeFunc = execute({ navigate: mockNavigate })(
        "https://example.com",
      );
      const transactions: Call[] = [
        {
          contractAddress: "0x123",
          entrypoint: "transfer",
          calldata: ["0x456", "100", "0"],
        },
      ];

      // trySessionExecute will handle authorization checks internally
      // and throw an error if unauthorized
      mockController.trySessionExecute.mockRejectedValue({
        code: ErrorCode.SessionRefreshRequired,
        message: "Session refresh required",
        data: "{}",
      });

      const result = await executeFunc(transactions);

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringMatching(/^\/execute\?/),
        { replace: true },
      );

      expect(result).toEqual({
        code: ResponseCodes.USER_INTERACTION_REQUIRED,
        message: "User interaction required",
      });
    });

    it("should handle execution errors", async () => {
      const executeFunc = execute({ navigate: mockNavigate })(
        "https://example.com",
      );
      const transactions: Call[] = [
        {
          contractAddress: "0x123",
          entrypoint: "transfer",
          calldata: ["0x456", "100", "0"],
        },
      ];

      // trySessionExecute throws an error which triggers UI navigation
      mockController.trySessionExecute.mockRejectedValue({
        code: "EXECUTION_ERROR",
        message: "Transaction failed",
        data: "{}",
      });

      const result = await executeFunc(transactions);

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringMatching(/^\/execute\?/),
        { replace: true },
      );

      // When trySessionExecute fails, we return USER_INTERACTION_REQUIRED
      expect(result).toEqual({
        code: ResponseCodes.USER_INTERACTION_REQUIRED,
        message: "User interaction required",
      });
    });

    it("should handle missing controller", async () => {
      // @ts-expect-error - Mocking global
      global.window = { controller: undefined };

      const executeFunc = execute({ navigate: mockNavigate })(
        "https://example.com",
      );
      const transactions: Call[] = [];

      await expect(executeFunc(transactions)).rejects.toEqual({
        message: "Controller context not available",
      });
    });
  });
});
