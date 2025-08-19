import { describe, it, expect } from "vitest";
import {
  starknetTransactionExecutionErrorTestCases,
  parseExecutionError,
  parseValidationError,
  parseGraphQLError,
  graphqlErrorTestCases,
} from "./errors";

describe("parseExecutionError", () => {
  starknetTransactionExecutionErrorTestCases.forEach(
    ({ input, expected }, i) => {
      it(`should correctly parse error at ${i}`, () => {
        const result = parseExecutionError(input, 0);
        expect(result).toEqual(expected);
      });
    },
  );
});

describe("parseValidationError", () => {
  it("should correctly parse insufficient balance error", () => {
    const error = {
      code: 55,
      message: "Account validation failed",
      data: "Max fee (308264936364000) exceeds balance (7443707172597).",
    };

    const result = parseValidationError(error);

    expect(result).toEqual({
      raw: "Max fee (308264936364000) exceeds balance (7443707172597).",
      summary: "Insufficient balance to pay for transaction fees",
      details: {
        maxFee: BigInt("308264936364000"),
        balance: BigInt("7443707172597"),
        additionalFunds: BigInt("300821229191403"),
      },
    });
  });

  it("should correctly parse gas price validation error", () => {
    const error = {
      code: 55,
      message: "Account validation failed",
      data: "Max L1 gas price (69174664530264) is lower than the actual gas price: 71824602546140.",
    };

    const result = parseValidationError(error);

    expect(result).toEqual({
      raw: "Max L1 gas price (69174664530264) is lower than the actual gas price: 71824602546140.",
      summary: "Gas price estimate is too low. Please try again.",
      details: {
        maxGasPrice: BigInt("69174664530264"),
        actualGasPrice: BigInt("71824602546140"),
      },
    });
  });
});

describe("parseGraphQLError", () => {
  graphqlErrorTestCases.forEach(({ input, expected }, i) => {
    it(`should correctly parse GraphQL error at ${i}`, () => {
      const result = parseGraphQLError(input);
      expect(result).toEqual(expected);
    });
  });

  it("should handle the specific controller not found error", () => {
    const error =
      'GraphQL API error: GraphQLErrors([Error { message: "rpc error: code = NotFound desc = controller not found for user test on network SN_MAIN", locations: None, path: Some([Key("createSession")]), extensions: None }])';

    const result = parseGraphQLError(error);

    expect(result).toEqual({
      raw: error,
      summary: "Wallet not found for this account",
      details: {
        operation: "createSession",
        network: "SN_MAIN",
        rpcError:
          "NotFound: controller not found for user test on network SN_MAIN",
        path: ["createSession"],
      },
    });
  });

  it("should handle GraphQL response with errors array", () => {
    const error = {
      errors: [
        {
          message:
            "rpc error: code = InvalidArgument desc = invalid session token",
          path: ["authenticate"],
          extensions: { code: "INVALID_TOKEN" },
        },
      ],
      data: null,
    };

    const result = parseGraphQLError(error);

    expect(result).toEqual({
      raw: JSON.stringify(error),
      summary: "Invalid request. Please check your input.",
      details: {
        operation: "authenticate",
        rpcError: "InvalidArgument: invalid session token",
        path: ["authenticate"],
      },
    });
  });

  it("should handle timeout errors", () => {
    const error = {
      errors: [
        {
          message: "Request timeout occurred",
          path: ["query"],
        },
      ],
    };

    const result = parseGraphQLError(error);

    expect(result).toEqual({
      raw: JSON.stringify(error),
      summary: "Request timed out. Please try again.",
      details: {
        operation: "query",
        path: ["query"],
      },
    });
  });

  it("should handle network connection errors", () => {
    const error = {
      errors: [
        {
          message: "Network connection failed",
          path: ["mutation"],
        },
      ],
    };

    const result = parseGraphQLError(error);

    expect(result).toEqual({
      raw: JSON.stringify(error),
      summary: "Connection error. Please check your internet connection.",
      details: {
        operation: "mutation",
        path: ["mutation"],
      },
    });
  });

  it("should handle permission denied errors", () => {
    const error =
      'GraphQLErrors([Error { message: "rpc error: code = PermissionDenied desc = access denied for operation", locations: None, path: Some([Key("executeTransaction")]), extensions: None }])';

    const result = parseGraphQLError(error);

    expect(result).toEqual({
      raw: error,
      summary: "You don't have permission to perform this action",
      details: {
        operation: "executeTransaction",
        rpcError: "PermissionDenied: access denied for operation",
        path: ["executeTransaction"],
      },
    });
  });

  it("should handle unauthenticated errors", () => {
    const error = {
      errors: [
        {
          message:
            "rpc error: code = Unauthenticated desc = authentication required",
          path: ["secureOperation"],
        },
      ],
    };

    const result = parseGraphQLError(error);

    expect(result).toEqual({
      raw: JSON.stringify(error),
      summary: "Please sign in to continue",
      details: {
        operation: "secureOperation",
        rpcError: "Unauthenticated: authentication required",
        path: ["secureOperation"],
      },
    });
  });

  it("should handle service unavailable errors", () => {
    const error = {
      errors: [
        {
          message:
            "rpc error: code = Unavailable desc = service temporarily down",
          path: ["healthCheck"],
        },
      ],
    };

    const result = parseGraphQLError(error);

    expect(result).toEqual({
      raw: JSON.stringify(error),
      summary: "Service is temporarily unavailable. Please try again later.",
      details: {
        operation: "healthCheck",
        rpcError: "Unavailable: service temporarily down",
        path: ["healthCheck"],
      },
    });
  });

  it("should handle rate limit errors", () => {
    const error = {
      errors: [
        {
          message: "Rate limit exceeded for this endpoint",
          path: ["apiCall"],
        },
      ],
    };

    const result = parseGraphQLError(error);

    expect(result).toEqual({
      raw: JSON.stringify(error),
      summary: "Rate limit exceeded for this endpoint",
      details: {
        operation: "apiCall",
        path: ["apiCall"],
      },
    });
  });

  it("should handle validation errors", () => {
    const error = {
      errors: [
        {
          message: "Request validation failed: invalid parameters",
          path: ["createUser"],
        },
      ],
    };

    const result = parseGraphQLError(error);

    expect(result).toEqual({
      raw: JSON.stringify(error),
      summary: "Invalid request. Please check your input.",
      details: {
        operation: "createUser",
        path: ["createUser"],
      },
    });
  });

  it("should handle generic string errors", () => {
    const error = "Generic error message without GraphQL formatting";

    const result = parseGraphQLError(error);

    expect(result).toEqual({
      raw: error,
      summary: "GraphQL request failed",
      details: {},
    });
  });

  it("should handle generic object errors", () => {
    const error = {
      message: "Something went wrong",
    };

    const result = parseGraphQLError(error);

    expect(result).toEqual({
      raw: JSON.stringify(error),
      summary: "Something went wrong",
      details: {},
    });
  });

  it("should handle errors with numeric path indices", () => {
    const error =
      'GraphQLErrors([Error { message: "rpc error: code = NotFound desc = item not found", locations: None, path: Some([Key("items"), 0, Key("id")]), extensions: None }])';

    const result = parseGraphQLError(error);

    expect(result).toEqual({
      raw: error,
      summary: "The requested resource was not found",
      details: {
        operation: "items",
        rpcError: "NotFound: item not found",
        path: ["items", 0, "id"],
      },
    });
  });

  it("should handle GraphQL response with no errors", () => {
    const error = {
      data: { user: null },
    };

    const result = parseGraphQLError(error);

    expect(result).toEqual({
      raw: JSON.stringify(error),
      summary: "GraphQL request completed with no data",
      details: {},
    });
  });

  it("should handle malformed GraphQLErrors string", () => {
    const error = "GraphQL API error: SomeOtherFormat[Invalid structure]";

    const result = parseGraphQLError(error);

    expect(result).toEqual({
      raw: error,
      summary: "GraphQL request failed",
      details: {},
    });
  });

  it("should truncate very long error messages", () => {
    const longMessage =
      "This is a very long error message that should be truncated because it exceeds the reasonable length limit for user display and would make the UI look bad with too much text";
    const error = {
      errors: [
        {
          message: longMessage,
          path: ["longOperation"],
        },
      ],
    };

    const result = parseGraphQLError(error);

    expect(result.summary).toBe(longMessage.substring(0, 97) + "...");
    expect(result.details.operation).toBe("longOperation");
  });

  it("should handle error objects with GraphQL in the message", () => {
    const error = {
      message: "Something went wrong with GraphQL operation",
    };

    const result = parseGraphQLError(error);

    expect(result).toEqual({
      raw: "Something went wrong with GraphQL operation",
      summary: "GraphQL request failed",
      details: {},
    });
  });
});
