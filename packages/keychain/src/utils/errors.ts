export function parseExecutionError(
  error: any,
  stackOffset: number = 1,
): {
  raw: string;
  stack: {
    address?: string;
    class?: string;
    selector?: string;
    error: string[];
  }[];
} {
  let executionError: string = error.data.execution_error;
  if (!executionError) {
    return {
      raw: JSON.stringify(error.data),
      stack: [],
    };
  }

  // Remove the "Transaction reverted: Transaction execution has failed:\n" prefix
  executionError = executionError.replace(
    /^Transaction reverted: Transaction execution has failed:\n/,
    "",
  );

  const rawStackTrace = executionError.split(/\n\d+: /);
  const stack = rawStackTrace.map((trace) => {
    const extractedInfo = {
      address: trace.match(/contract address: (0x[a-fA-F0-9]+)/)?.[1],
      class: trace.match(/class hash: (0x[a-fA-F0-9]+)/)?.[1],
      selector: trace.match(/selector: (0x[a-fA-F0-9]+)/)?.[1],
      error: [],
    };

    const errorLines = trace
      .split("\n")
      .slice(1)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (errorLines.length > 0) {
      if (errorLines[0].startsWith("Error at pc=")) {
        extractedInfo.error = errorLines.slice(1);
      } else if (errorLines[0].includes("Entry point")) {
        extractedInfo.error = ["Function not found in the contract"];
      } else {
        extractedInfo.error = errorLines;
      }
    }

    if (extractedInfo.error.length === 0) {
      extractedInfo.error = ["Unknown error"];
    }

    return extractedInfo;
  });

  return {
    raw: executionError,
    stack: stack.slice(stackOffset),
  };
}
