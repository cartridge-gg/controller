export function parseExecutionError(error: any): {
  raw: string;
  stack: {
    address?: string;
    class?: string;
    selector?: string;
    error: string;
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
      error:
        trace.match(/Error at pc=.*:\n([\s\S]*?)(?=\n\d+:|$)/)?.[1]?.trim() ||
        trace.match(/Entry point .* not found in contract./)?.[0] ||
        trace.split("\n").slice(1).join("\n").trim() ||
        "Unknown error",
    };

    // Map "Entry point not found" error to a more human-readable message
    if (extractedInfo.error && extractedInfo.error.includes("Entry point")) {
      extractedInfo.error = "Function not found in the contract";
    }

    return extractedInfo;
  });

  return {
    raw: executionError,
    stack,
  };
}
