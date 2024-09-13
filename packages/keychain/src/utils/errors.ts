import { ControllerError } from "@cartridge/controller";

export function parseExecutionError(
  error: any,
  stackOffset: number = 1,
): {
  raw: string;
  summary: string;
  stack: {
    address?: string;
    class?: string;
    selector?: string;
    error: string[];
  }[];
} {
  let executionError: string = error.data?.execution_error;
  if (!executionError) {
    return {
      raw: JSON.stringify(error.data),
      summary: error.message,
      stack: [],
    };
  }

  let executionErrorRaw = executionError;

  // Remove the "Transaction reverted: Transaction execution has failed:\n" prefix
  executionError = executionError.replace(/^Transaction reverted: /, "");

  // Remove the "Transaction reverted: Transaction execution has failed:\n" prefix
  executionError = executionError.replace(
    /^Transaction execution has failed:\n/,
    "",
  );

  // Remove the "Transaction validation error:" prefix if it exists
  executionError = executionError.replace(
    /^Transaction validation error: /,
    "",
  );

  const rawStackTrace = executionError.split(/\n\d+: /);
  const stack = rawStackTrace.map((trace) => {
    const extractedInfo: {
      address?: string;
      class?: string;
      selector?: string;
      error: string[];
    } = {
      address:
        trace.match(/contract address: (0x[a-fA-F0-9]+)/)?.[1] ||
        trace.match(/Requested contract address (0x[a-fA-F0-9]+)/)?.[1],
      class: trace.match(/class hash: (0x[a-fA-F0-9]+)/)?.[1],
      selector: trace.match(/selector: (0x[a-fA-F0-9]+)/)?.[1],
      error: [],
    };

    if (
      extractedInfo.class ===
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    ) {
      delete extractedInfo.class;
    }

    const errorLines = trace
      .split("\n")
      .slice(1)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (errorLines.length > 0) {
      if (errorLines[0].startsWith("Error at pc=")) {
        extractedInfo.error = errorLines.slice(1);
      } else if (
        errorLines[0].includes("Entry point") &&
        errorLines[0].includes("not found in contract")
      ) {
        extractedInfo.error = ["Function not found in the contract."];
      } else if (
        errorLines[0].startsWith("Execution failed. Failure reason:")
      ) {
        const failureReason = errorLines[0].match(/'([^']+)'/)?.[1];
        if (failureReason) {
          extractedInfo.error = [failureReason];
        } else {
          extractedInfo.error = errorLines;
        }
      } else {
        extractedInfo.error = errorLines;
      }
    }

    if (extractedInfo.error.length === 0) {
      extractedInfo.error = [trace.trim()];
    }

    return extractedInfo;
  });

  const processedStack =
    stack.length > stackOffset
      ? stack.slice(stackOffset)
      : [stack[stack.length - 1]];

  // Generate summary based on the last error in the stack
  let summary = "Execution error";
  if (processedStack.length > 0) {
    const lastError = processedStack[processedStack.length - 1].error;
    if (lastError.length > 0) {
      const lastErrorMessage = lastError.join(" ");
      if (lastErrorMessage.includes("is not deployed")) {
        summary = "Contract not deployed.";
        lastError[lastError.length - 1] = summary;
      } else if (lastErrorMessage.includes("ASSERT_EQ instruction failed")) {
        summary = "Assertion failed in contract.";
      } else if (
        lastErrorMessage.includes("ERC20: amount is not a valid Uint256")
      ) {
        summary = "Invalid token amount.";
      } else if (
        lastErrorMessage.includes("Function not found in the contract")
      ) {
        summary = "Function not found in the contract.";
      } else if (lastErrorMessage === "argent/invalid-timestamp") {
        summary = "Invalid paymaster transaction timestamp";
        lastError[lastError.length - 1] = summary;
      } else if (lastErrorMessage === "session/already-registered") {
        summary = "Session already registered";
        lastError[lastError.length - 1] = summary;
      } else {
        summary = lastErrorMessage;
        lastError[lastError.length - 1] = summary;
      }
    }
  }

  return {
    raw: executionErrorRaw,
    summary,
    stack: processedStack,
  };
}

export function parseValidationError(error: ControllerError): {
  raw: string;
  summary: string;
  details:
    | {
        maxFee?: bigint;
        balance?: bigint;
        additionalFunds?: bigint;
      }
    | string;
} {
  const maxFeeMatch = error.data.match(
    /Max fee \((\d+)\) exceeds balance \((\d+)\)/,
  );
  if (maxFeeMatch) {
    const maxFee = BigInt(maxFeeMatch[1]);
    const balance = BigInt(maxFeeMatch[2]);
    const additionalFunds = maxFee - balance;
    return {
      raw: error.data,
      summary: "Insufficient balance for transaction fee",
      details: {
        maxFee,
        balance,
        additionalFunds,
      },
    };
  }

  return {
    raw: error.data || JSON.stringify(error),
    summary: "Account validation failed",
    details: error.message || "Unknown validation error",
  };
}
