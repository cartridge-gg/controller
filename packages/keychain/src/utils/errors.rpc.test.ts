import { describe, it, expect } from "vitest";
import { parseExecutionError } from "./errors";

describe("parseExecutionError - RPC Nested Error Format", () => {
  it("should correctly parse RPC error with Nested error format", () => {
    const rpcError = {
      id: 1,
      jsonrpc: "2.0",
      error: {
        code: 41,
        message: "Transaction execution error",
        data: {
          transaction_index: 0,
          execution_error:
            "Contract address= 0x13f1386e3d4267a1502d8ca782d34b63634d969d3c527a511814c2ef67b84c4, Class hash= 0x743c83c41ce99ad470aa308823f417b2141e02e04571f5c0004e743556e7faf, Selector= 0x15d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad, Nested error: (0x617267656e742f6d756c746963616c6c2d6661696c6564 ('argent/multicall-failed'), 0x1, 0x45524332303a20696e73756666696369656e742062616c616e6365 ('ERC20: insufficient balance'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'))",
        },
      },
    };

    const result = parseExecutionError(rpcError.error, 0);

    expect(result).toEqual({
      raw: "Contract address= 0x13f1386e3d4267a1502d8ca782d34b63634d969d3c527a511814c2ef67b84c4, Class hash= 0x743c83c41ce99ad470aa308823f417b2141e02e04571f5c0004e743556e7faf, Selector= 0x15d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad, Nested error: (0x617267656e742f6d756c746963616c6c2d6661696c6564 ('argent/multicall-failed'), 0x1, 0x45524332303a20696e73756666696369656e742062616c616e6365 ('ERC20: insufficient balance'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'))",
      summary: "ERC20: insufficient balance",
      stack: [
        {
          address:
            "0x13f1386e3d4267a1502d8ca782d34b63634d969d3c527a511814c2ef67b84c4",
          class:
            "0x743c83c41ce99ad470aa308823f417b2141e02e04571f5c0004e743556e7faf",
          selector:
            "0x15d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad",
          error: ["ERC20: insufficient balance"],
        },
      ],
    });
  });

  it("should handle Nested error with different meaningful error", () => {
    const error = {
      code: 41,
      message: "Transaction execution error",
      data: {
        transaction_index: 0,
        execution_error:
          "Contract address= 0x123, Class hash= 0x456, Selector= 0x789, Nested error: (0x617267656e742f6d756c746963616c6c2d6661696c6564 ('argent/multicall-failed'), 0x1, 0x4e6f7420617574686f72697a656420746f20616374 ('Not authorized to act'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'))",
      },
    };

    const result = parseExecutionError(error, 0);

    expect(result.summary).toBe("Not authorized to act");
    expect(result.stack[0].error).toEqual(["Not authorized to act"]);
    expect(result.stack[0].address).toBe("0x123");
    expect(result.stack[0].class).toBe("0x456");
    expect(result.stack[0].selector).toBe("0x789");
  });

  it("should handle Nested error with no meaningful error", () => {
    const error = {
      code: 41,
      message: "Transaction execution error",
      data: {
        transaction_index: 0,
        execution_error:
          "Contract address= 0xabc, Class hash= 0xdef, Selector= 0x111, Nested error: (0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'))",
      },
    };

    const result = parseExecutionError(error, 0);

    expect(result.summary).toBe("Transaction execution failed");
    expect(result.stack[0].error).toEqual([
      "ENTRYPOINT_FAILED",
      "ENTRYPOINT_FAILED",
    ]);
  });

  it("should handle Nested error with hex-only values", () => {
    const error = {
      code: 41,
      message: "Transaction execution error",
      data: {
        transaction_index: 0,
        execution_error:
          "Contract address= 0x222, Class hash= 0x333, Selector= 0x444, Nested error: (0x617267656e742f6d756c746963616c6c2d6661696c6564 ('argent/multicall-failed'), 0x0, 0x1, 0xabcdef123456)",
      },
    };

    const result = parseExecutionError(error, 0);

    // argent/multicall-failed is not meaningful by itself when it's the only non-hex error
    expect(result.summary).toBe("Transaction execution failed");
    // The function only returns the meaningful error in the error array
    expect(result.stack[0].error).toEqual(["argent/multicall-failed"]);
  });

  it("should extract correct summary for insufficient balance error", () => {
    const error = {
      code: 41,
      message: "Transaction execution error",
      data: {
        execution_error:
          "Contract address= 0x555, Class hash= 0x666, Selector= 0x777, Nested error: (0x617267656e742f6d756c746963616c6c2d6661696c6564 ('argent/multicall-failed'), 0x45524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e6365 ('ERC20: transfer amount exceeds balance'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'))",
      },
    };

    const result = parseExecutionError(error, 0);

    expect(result.summary).toBe("ERC20: transfer amount exceeds balance");
  });

  it("should handle Nested error with missing contract details", () => {
    const error = {
      code: 41,
      message: "Transaction execution error",
      data: {
        execution_error:
          "Nested error: (0x617267656e742f6d756c746963616c6c2d6661696c6564 ('argent/multicall-failed'), 0x536f6d65206572726f72 ('Some error'))",
      },
    };

    const result = parseExecutionError(error, 0);

    expect(result.summary).toBe("Some error");
    expect(result.stack[0].address).toBeUndefined();
    expect(result.stack[0].class).toBeUndefined();
    expect(result.stack[0].selector).toBeUndefined();
    expect(result.stack[0].error).toEqual(["Some error"]);
  });

  it("should handle malformed Nested error format", () => {
    const error = {
      code: 41,
      message: "Transaction execution error",
      data: {
        execution_error: "Contract address= 0x888, Nested error: malformed",
      },
    };

    // This should fall through to the existing error handling
    const result = parseExecutionError(error, 0);

    // Since the Nested error format is malformed, it should be processed as a regular error
    expect(result.raw).toBe("Contract address= 0x888, Nested error: malformed");
  });

  it("should parse 'Not active' error correctly", () => {
    const error = {
      code: 41,
      message: "Transaction execution error",
      data: {
        transaction_index: 0,
        execution_error:
          "Contract address= 0x4bb778faff2bfcc23e97b3a184c9658e8048351ab68dc56e1f493bac3b20794, Class hash= 0x743c83c41ce99ad470aa308823f417b2141e02e04571f5c0004e743556e7faf, Selector= 0x15d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad, Nested error: (0x617267656e742f6d756c746963616c6c2d6661696c6564 ('argent/multicall-failed'), 0x4e6f7420616374697665 ('Not active'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'))",
      },
    };

    const result = parseExecutionError(error, 0);

    expect(result.summary).toBe("Not active");
    expect(result.stack[0].error).toEqual(["Not active"]);
    expect(result.stack[0].address).toBe(
      "0x4bb778faff2bfcc23e97b3a184c9658e8048351ab68dc56e1f493bac3b20794",
    );
    expect(result.stack[0].class).toBe(
      "0x743c83c41ce99ad470aa308823f417b2141e02e04571f5c0004e743556e7faf",
    );
    expect(result.stack[0].selector).toBe(
      "0x15d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad",
    );
  });

  it("should handle ENTRYPOINT_NOT_FOUND with empty error and display generic message", () => {
    const error = {
      code: 41,
      message: "Transaction execution error",
      data: {
        transaction_index: 0,
        execution_error:
          "Transaction execution has failed:\n0: Error in the called contract (contract address: 0x04fdcb829582d172a6f3858b97c16da38b08da5a1df7101a5d285b868d89921b, class hash: 0x0743c83c41ce99ad470aa308823f417b2141e02e04571f5c0004e743556e7faf, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nExecution failed. Failure reason:\n(0x617267656e742f6d756c746963616c6c2d6661696c6564 ('argent/multicall-failed'), 0x0 (''), 0x454e545259504f494e545f4e4f545f464f554e44 ('ENTRYPOINT_NOT_FOUND'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED')).",
      },
    };

    const result = parseExecutionError(error, 0);

    expect(result.summary).toBe("Transaction execution failed");
    expect(result.stack[0].address).toBe(
      "0x04fdcb829582d172a6f3858b97c16da38b08da5a1df7101a5d285b868d89921b",
    );
    expect(result.stack[0].class).toBe(
      "0x0743c83c41ce99ad470aa308823f417b2141e02e04571f5c0004e743556e7faf",
    );
    expect(result.stack[0].selector).toBe(
      "0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad",
    );
  });

  it('should correctly parse "free games exceeds max" error', () => {
    const error = {
      code: 41,
      message: "Transaction execution error",
      data: {
        transaction_index: 0,
        execution_error:
          "Contract address= 0x6a953c60b4ada1551b363c9171b3f89c6814df1432c51f6b5ba2c9ba938b48f, Class hash= 0xe2eb8f5672af4e6a4e8a8f1b44989685e668489b0a25437733756c5a34a1d6, Selector= 0x15d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad, Nested error: (0x617267656e742f6d756c746963616c6c2d6661696c6564 ('argent/multicall-failed'), 0x0 (''), \"free games exceeds max\", 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'))",
      },
    };

    const result = parseExecutionError(error, 0);

    expect(result.summary).toBe("Free games exceeds max");
    expect(result.stack[0].address).toBe(
      "0x6a953c60b4ada1551b363c9171b3f89c6814df1432c51f6b5ba2c9ba938b48f",
    );
    expect(result.stack[0].class).toBe(
      "0xe2eb8f5672af4e6a4e8a8f1b44989685e668489b0a25437733756c5a34a1d6",
    );
    expect(result.stack[0].selector).toBe(
      "0x15d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad",
    );
    expect(result.stack[0].error).toEqual(["free games exceeds max"]);
  });
});
