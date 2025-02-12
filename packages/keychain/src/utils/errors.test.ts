import { describe, it, expect } from "vitest";
import {
  starknetTransactionExecutionErrorTestCases,
  parseExecutionError,
  parseValidationError,
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
      summary: "Insufficient balance for transaction fee",
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
      summary: "Gas price too high",
      details: {
        maxGasPrice: BigInt("69174664530264"),
        actualGasPrice: BigInt("71824602546140"),
      },
    });
  });
});
