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
  executionError = executionError.replace(
    /^Transaction reverted: Transaction execution has failed:\n/,
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
        lastError[lastError.length - 1] = "Contract not deployed.";
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
      } else {
        summary = "Execution error.";
      }
    }
  }

  return {
    raw: executionErrorRaw,
    summary,
    stack: processedStack,
  };
}
