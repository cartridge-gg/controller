import { ControllerError } from "@cartridge/controller";

interface GraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
}

interface GraphQLResponse {
  errors?: GraphQLError[];
  data?: unknown;
}

export function parseGraphQLError(error: unknown): {
  raw: string;
  summary: string;
  details: {
    operation?: string;
    network?: string;
    rpcError?: string;
    path?: Array<string | number>;
  };
} {
  let graphqlResponse: GraphQLResponse;

  // Handle different error formats
  if (typeof error === "string") {
    // Handle string errors that might contain GraphQL error information
    try {
      if (error.includes("GraphQLErrors")) {
        // Parse the GraphQLErrors format: GraphQLErrors([Error { ... }])
        const match = error.match(/GraphQLErrors\(\[(.*)\]\)$/);
        if (match) {
          const errorString = match[1];

          // Extract message
          const messageMatch = errorString.match(/message: "([^"]+)"/);
          const message = messageMatch?.[1] || "Unknown GraphQL error";

          // Extract path if present
          const pathMatch = errorString.match(/path: Some\(\[([^\]]+)\]\)/);
          let path: Array<string | number> | undefined;
          if (pathMatch) {
            try {
              // Parse path elements like Key("createSession"), 0, Key("id")
              const pathString = pathMatch[1];
              const pathElements: Array<string | number> = [];

              // Split by comma but be careful of commas inside quotes
              let current = "";
              let inQuotes = false;
              let depth = 0;

              for (let i = 0; i < pathString.length; i++) {
                const char = pathString[i];
                if (char === '"') {
                  inQuotes = !inQuotes;
                  current += char;
                } else if (char === "(" && !inQuotes) {
                  depth++;
                  current += char;
                } else if (char === ")" && !inQuotes) {
                  depth--;
                  current += char;
                } else if (char === "," && !inQuotes && depth === 0) {
                  // Process the current element
                  const element = current.trim();
                  const keyMatch = element.match(/Key\("([^"]+)"\)/);
                  if (keyMatch) {
                    pathElements.push(keyMatch[1]);
                  } else {
                    const numMatch = element.match(/^(\d+)$/);
                    if (numMatch) {
                      pathElements.push(parseInt(numMatch[1]));
                    } else {
                      pathElements.push(element);
                    }
                  }
                  current = "";
                } else {
                  current += char;
                }
              }

              // Handle the last element
              if (current.trim()) {
                const element = current.trim();
                const keyMatch = element.match(/Key\("([^"]+)"\)/);
                if (keyMatch) {
                  pathElements.push(keyMatch[1]);
                } else {
                  const numMatch = element.match(/^(\d+)$/);
                  if (numMatch) {
                    pathElements.push(parseInt(numMatch[1]));
                  } else {
                    pathElements.push(element);
                  }
                }
              }

              path = pathElements;
            } catch {
              // Ignore path parsing errors
            }
          }

          return parseGraphQLErrorMessage(message, path, error);
        }
      }

      // Try to parse as JSON
      graphqlResponse = JSON.parse(error);
    } catch {
      // If parsing fails, treat as a generic error message
      return {
        raw: error,
        summary: "GraphQL request failed",
        details: {},
      };
    }
  } else if (
    typeof error === "object" &&
    error !== null &&
    ("errors" in error || "data" in error)
  ) {
    // Direct GraphQL response object
    graphqlResponse = error as GraphQLResponse;
  } else if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string" &&
    (error as { message: string }).message.includes("GraphQL")
  ) {
    // Error object with GraphQL information in the message
    return parseGraphQLError((error as { message: string }).message);
  } else {
    // Generic error object
    const errorMessage =
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message: unknown }).message === "string"
        ? (error as { message: string }).message
        : "Unknown GraphQL error";

    return {
      raw: JSON.stringify(error),
      summary: errorMessage,
      details: {},
    };
  }

  // Process GraphQL response
  if (graphqlResponse?.errors && graphqlResponse.errors.length > 0) {
    const firstError = graphqlResponse.errors[0];
    return parseGraphQLErrorMessage(
      firstError.message,
      firstError.path,
      JSON.stringify(graphqlResponse),
    );
  }

  return {
    raw: JSON.stringify(graphqlResponse || error),
    summary: "GraphQL request completed with no data",
    details: {},
  };
}

function parseGraphQLErrorMessage(
  message: string,
  path?: Array<string | number>,
  raw?: string,
): {
  raw: string;
  summary: string;
  details: {
    operation?: string;
    network?: string;
    rpcError?: string;
    path?: Array<string | number>;
  };
} {
  const details: {
    operation?: string;
    network?: string;
    rpcError?: string;
    path?: Array<string | number>;
  } = {};

  if (path) {
    details.path = path;
    if (path.length > 0 && typeof path[0] === "string") {
      details.operation = path[0];
    }
  }

  // Parse RPC errors from the message
  const rpcMatch = message.match(/rpc error: code = (\w+) desc = (.+)/);
  if (rpcMatch) {
    const [, code, description] = rpcMatch;
    details.rpcError = `${code}: ${description}`;

    // Extract network from description if present
    const networkMatch = description.match(/network (\w+)/);
    if (networkMatch) {
      details.network = networkMatch[1];
    }

    // Generate user-friendly summary based on error type
    if (code === "NotFound") {
      if (description.includes("controller not found")) {
        return {
          raw: raw || message,
          summary: "Controller not found for user",
          details,
        };
      } else if (description.includes("user")) {
        return {
          raw: raw || message,
          summary: "User not found",
          details,
        };
      } else {
        return {
          raw: raw || message,
          summary: "Resource not found",
          details,
        };
      }
    } else if (code === "InvalidArgument") {
      if (description.includes("Amount is below minimum")) {
        return {
          raw: raw || message,
          summary: "Bridge amount is too low for this network",
          details,
        };
      }
      return {
        raw: raw || message,
        summary: "Invalid request parameters",
        details,
      };
    } else if (code === "PermissionDenied") {
      return {
        raw: raw || message,
        summary: "Access denied",
        details,
      };
    } else if (code === "Unauthenticated") {
      return {
        raw: raw || message,
        summary: "Authentication required",
        details,
      };
    } else if (code === "Unavailable") {
      return {
        raw: raw || message,
        summary: "Service temporarily unavailable",
        details,
      };
    } else if (code === "Internal") {
      // For Internal errors, use the description as the summary
      return {
        raw: raw || message,
        summary: description || "Internal server error",
        details,
      };
    } else {
      return {
        raw: raw || message,
        summary: `Service error: ${code}`,
        details,
      };
    }
  }

  // Handle other common GraphQL error patterns
  if (message.includes("timeout") || message.includes("deadline")) {
    return {
      raw: raw || message,
      summary: "Request timeout",
      details,
    };
  } else if (message.includes("network") || message.includes("connection")) {
    return {
      raw: raw || message,
      summary: "Network connection error",
      details,
    };
  } else if (message.includes("validation")) {
    return {
      raw: raw || message,
      summary: "Request validation failed",
      details,
    };
  } else if (message.includes("rate limit")) {
    return {
      raw: raw || message,
      summary: "Rate limit exceeded",
      details,
    };
  }

  // Default case
  return {
    raw: raw || message,
    summary: message.length > 100 ? message.substring(0, 100) + "..." : message,
    details,
  };
}

/**
 * Parses a ClientError from graphql-request library
 * ClientError structure includes response with errors array and request details
 */
export function parseClientError(error: unknown): {
  raw: string;
  summary: string;
  errors: Array<{
    message: string;
    path?: Array<string | number>;
  }>;
  details: {
    operation?: string;
    network?: string;
    rpcError?: string;
    path?: Array<string | number>;
  };
} | null {
  // Check if this is a ClientError from graphql-request
  if (typeof error === "object" && error !== null && "response" in error) {
    const errorWithResponse = error as { response: unknown };
    if (
      typeof errorWithResponse.response === "object" &&
      errorWithResponse.response !== null &&
      "errors" in errorWithResponse.response
    ) {
      const clientError = error as {
        response: {
          errors?: GraphQLError[];
          data?: unknown;
          status?: number;
          headers?: unknown;
        };
        request?: {
          query?: string;
          variables?: unknown;
        };
      };

      // Use the existing parseGraphQLError function to parse the response
      if (
        clientError.response.errors &&
        clientError.response.errors.length > 0
      ) {
        const result = parseGraphQLError({
          errors: clientError.response.errors,
        });

        // Store the full ClientError as the raw error for debugging
        result.raw = JSON.stringify(error);

        // Add all errors to the result
        const enhancedResult = {
          ...result,
          errors: clientError.response.errors.map((err) => ({
            message: err.message,
            path: err.path,
          })),
        };

        return enhancedResult;
      }
    }
  }

  return null;
}

/**
 * Type definitions for GraphQL errors with RPC error details
 */
export interface GraphQLErrorDetails {
  raw: string;
  summary: string;
  errors?: Array<{
    message: string;
    path?: Array<string | number>;
  }>;
  details: {
    operation?: string;
    network?: string;
    rpcError?: string;
    path?: Array<string | number>;
  };
}

export interface ErrorWithGraphQL extends Error {
  graphqlError?: GraphQLErrorDetails;
}

export class ExternalWalletError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExternalWalletError";
  }
}

function capitalizeFirstLetter(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function parseExecutionError(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const parsedData =
    typeof error.data === "string" ? JSON.parse(error.data) : error.data;
  let executionError = parsedData?.execution_error;

  if (!executionError) {
    return {
      raw: JSON.stringify(error.data),
      summary: capitalizeFirstLetter(error.message),
      stack: [],
    };
  }

  // Handle the "Nested error" format from JSON-RPC responses
  if (
    typeof executionError === "string" &&
    executionError.includes("Nested error:")
  ) {
    // Extract the final meaningful error from nested errors
    // Look for patterns like "Nested error: ... Nested error: ... 0x... ('actual error')"
    const hexAndTextPattern = /0x[a-fA-F0-9]+\s*\('([^']+)'\)/g;
    const allMatches = [...executionError.matchAll(hexAndTextPattern)];

    // Keep track of all errors found for fallback
    let allFoundErrors: string[] = allMatches
      .map((match) => match[1])
      .filter((err) => err !== "");

    // Find the last meaningful error that's not a generic framework error
    let meaningfulError = null;
    for (let i = allMatches.length - 1; i >= 0; i--) {
      const err = allMatches[i][1];
      if (
        err !== "argent/multicall-failed" &&
        err !== "ENTRYPOINT_FAILED" &&
        err !== "ENTRYPOINT_NOT_FOUND" &&
        err !== "" // Exclude empty strings
      ) {
        meaningfulError = err;
        break;
      }
    }

    // If no meaningful error found in hex format, try to extract from the nested content
    if (!meaningfulError) {
      const nestedMatch = executionError.match(/Nested error:\s*\((.*)\)/s);
      if (nestedMatch) {
        const nestedContent = nestedMatch[1];

        // Extract all error messages from the nested content
        // Match both single-quoted strings and double-quoted strings
        const singleQuoted = [...nestedContent.matchAll(/'([^']*)'/g)].map(
          (match) => match[1],
        );
        const doubleQuoted = [...nestedContent.matchAll(/"([^"]*)"/g)].map(
          (match) => match[1],
        );
        const allErrors = [...singleQuoted, ...doubleQuoted];

        // Update allFoundErrors with the fallback parsing results if they're more comprehensive
        if (allErrors.length > allFoundErrors.length) {
          allFoundErrors = allErrors.filter((err) => err !== "");
        }

        // Find the most meaningful error, excluding common framework errors
        meaningfulError = allErrors.find(
          (err) =>
            err !== "argent/multicall-failed" &&
            err !== "ENTRYPOINT_FAILED" &&
            err !== "ENTRYPOINT_NOT_FOUND" &&
            err !== "0x0" && // Exclude separator
            !err.match(/^0x[0-9a-fA-F]+$/) && // Exclude pure hex values
            err !== "0x1" && // Exclude other separators
            err !== "", // Exclude empty strings
        );
      }
    }

    // Extract all contract details from the execution error (there may be multiple due to nesting)
    const contractMatches = [
      ...executionError.matchAll(/Contract address=\s*(0x[a-fA-F0-9]+)/g),
    ];
    const classMatches = [
      ...executionError.matchAll(/Class hash=\s*(0x[a-fA-F0-9]+)/g),
    ];
    const selectorMatches = [
      ...executionError.matchAll(/Selector=\s*(0x[a-fA-F0-9]+)/g),
    ];

    // Use the last (deepest) contract details if multiple are found
    const lastContractMatch = contractMatches[contractMatches.length - 1];
    const lastClassMatch = classMatches[classMatches.length - 1];
    const lastSelectorMatch = selectorMatches[selectorMatches.length - 1];

    // For the error array in stack, include all found errors even if not "meaningful"
    let errorArray: string[] = [];
    if (meaningfulError) {
      errorArray = [meaningfulError];
    } else {
      // If no meaningful error found, include all errors that were found
      errorArray =
        allFoundErrors.length > 0
          ? allFoundErrors
          : ["Transaction execution failed"];
    }

    return {
      raw: executionError,
      summary: capitalizeFirstLetter(
        meaningfulError || "Transaction execution failed",
      ),
      stack: [
        {
          address: lastContractMatch?.[1],
          class: lastClassMatch?.[1],
          selector: lastSelectorMatch?.[1],
          error: errorArray,
        },
      ],
    };
  }

  // Handle object format execution error
  if (typeof executionError === "object" && executionError.error) {
    const objectError = executionError;
    const errorMessage = objectError.error;

    // Parse the tuple error format
    const tupleMatch = errorMessage.match(/^\((.*)\)$/);
    if (tupleMatch) {
      // Extract all quoted strings from the tuple (both single and double quotes)
      const singleQuoted = [...tupleMatch[1].matchAll(/'([^']*)'/g)].map(
        (match) => match[1],
      );
      const doubleQuoted = [...tupleMatch[1].matchAll(/"([^"]*)"/g)].map(
        (match) => match[1],
      );
      const allErrors = [...singleQuoted, ...doubleQuoted];
      const meaningfulError =
        allErrors.find(
          (err) =>
            err !== "argent/multicall-failed" &&
            err !== "ENTRYPOINT_FAILED" &&
            err !== "ENTRYPOINT_NOT_FOUND" &&
            err !== "0x0" && // Exclude separator
            err !== "" && // Exclude empty strings
            !err.match(/^0x[0-9a-fA-F]+$/), // Exclude hex values that might leak through
        ) || allErrors[0];

      return {
        raw: JSON.stringify(executionError),
        summary: capitalizeFirstLetter(
          meaningfulError || "There was an error in the transaction",
        ),
        stack: [
          {
            address: objectError.contract_address,
            class: objectError.class_hash,
            selector: objectError.selector,
            error: meaningfulError
              ? [meaningfulError]
              : allErrors.length > 0
                ? allErrors
                : [errorMessage],
          },
        ],
      };
    }

    // Convert object format to string format for compatibility
    executionError = `Transaction execution has failed:\n0: Error in the called contract (contract address: ${objectError.contract_address}, class hash: ${objectError.class_hash}, selector: ${objectError.selector}):\nExecution failed. Failure reason: ${objectError.error}.`;
  }

  let summaryOveride;
  const executionErrorRaw =
    typeof executionError === "string"
      ? executionError
      : JSON.stringify(executionError);

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

  // Remove the "Contract constructor execution error:" prefix if it exists
  if (executionError.startsWith("Contract constructor execution error:")) {
    executionError = executionError.replace(
      /^Contract constructor execution error: /,
      "",
    );
    summaryOveride = "Contract constructor error";
  }

  const rawStackTrace = executionError.split(/\n\d+: /);
  const stack = rawStackTrace.map((trace: string) => {
    const extractedInfo: {
      address?: string;
      class?: string;
      selector?: string;
      error: string[];
    } = {
      address:
        trace.match(/contract address: (0x[a-fA-F0-9]+)/)?.[1] ||
        trace.match(/Requested contract address (0x[a-fA-F0-9]+)/)?.[1] ||
        trace.match(
          /address: ContractAddress\(PatriciaKey\((0x[a-fA-F0-9]+)\)\)/,
        )?.[1],
      class:
        trace.match(/class hash: (0x[a-fA-F0-9]+)/)?.[1] ||
        (() => {
          const match = trace.match(/contract class (\d+)/);
          return match?.[1] ? "0x" + BigInt(match[1]).toString(16) : undefined;
        })(),
      selector:
        trace.match(/selector: (0x[a-fA-F0-9]+)/)?.[1] ||
        trace.match(
          /selector: Some\(EntryPointSelector\((0x[a-fA-F0-9]+)\)\)/,
        )?.[1],
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
      .slice(trace.split("\n").length > 1 ? 1 : 0)
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);

    if (errorLines.length > 0) {
      if (errorLines[0].startsWith("Error at pc=")) {
        extractedInfo.error = errorLines.slice(1);
      } else if (
        errorLines[0].includes("Entry point") &&
        errorLines[0].includes("not found in contract")
      ) {
        extractedInfo.error = ["Function not found in the contract."];
      } else if (errorLines[0].includes("Failure reason:")) {
        // Check if it's a tuple format with multiple errors
        // Handle both inline and multiline formats
        const fullError = errorLines.join("\n");
        const tupleMatch = fullError.match(
          /Failure reason:\s*\n?\s*\((.*)\)\./s,
        );
        if (tupleMatch) {
          // Extract all quoted strings from the tuple (both single and double quotes)
          const singleQuoted = [...tupleMatch[1].matchAll(/'([^']*)'/g)].map(
            (match) => match[1],
          );
          const doubleQuoted = [...tupleMatch[1].matchAll(/"([^"]*)"/g)].map(
            (match) => match[1],
          );
          const allErrors = [...singleQuoted, ...doubleQuoted];

          // Find the most meaningful error, excluding common framework errors
          const meaningfulError = allErrors.find(
            (err) =>
              err !== "argent/multicall-failed" &&
              err !== "ENTRYPOINT_FAILED" &&
              err !== "ENTRYPOINT_NOT_FOUND" &&
              err !== "0x0" && // Exclude separator like 0x0
              err !== "" && // Exclude empty strings
              !err.match(/^0x[0-9a-fA-F]+$/), // Exclude hex values that might leak through
          );

          // Use the meaningful error if found, otherwise fall back to all errors
          extractedInfo.error = meaningfulError
            ? [meaningfulError]
            : allErrors.length > 0
              ? allErrors
              : [tupleMatch[1]];
        } else {
          // Single error format
          const failureReason = errorLines[0].match(/'([^']+)'/)?.[1];
          if (failureReason) {
            extractedInfo.error = [failureReason];
          } else {
            extractedInfo.error = errorLines;
          }
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
      } else if (
        lastErrorMessage.includes("ERC20: transfer amount exceeds balance") ||
        lastErrorMessage.includes("transfer amount exceeds balance")
      ) {
        summary = "Insufficient token balance";
      } else if (
        lastErrorMessage.includes("SafeUint256: subtraction overflow") ||
        lastErrorMessage.includes("subtraction overflow")
      ) {
        summary = "Insufficient balance for operation";
      } else if (
        lastErrorMessage.includes("ERC20: amount is not a valid Uint256")
      ) {
        summary = "Invalid token amount.";
      } else if (lastErrorMessage.includes("ASSERT_EQ instruction failed")) {
        summary = "Assertion failed in contract.";
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
      } else if (
        /.*Class with hash.*is not declared.$/.test(lastErrorMessage)
      ) {
        summary = "Class hash is not declared.";
      } else if (
        lastError.some((err: string) => err === "argent/multicall-failed")
      ) {
        // If multicall failed, look for the actual error
        const actualError = lastError.find(
          (err: string) =>
            err !== "argent/multicall-failed" &&
            err !== "ENTRYPOINT_FAILED" &&
            err !== "ENTRYPOINT_NOT_FOUND" &&
            err !== "0x0" && // Exclude separator
            err !== "" && // Exclude empty strings
            !err.match(/^0x[0-9a-fA-F]+$/), // Exclude hex values
        );
        summary = actualError || "Transaction execution failed";
      } else {
        // Try to find a meaningful error message instead of raw hex or technical errors
        const meaningfulError = lastError.find(
          (err: string) =>
            !err.match(/^0x[0-9a-fA-F]+$/) &&
            err !== "ENTRYPOINT_FAILED" &&
            err !== "0x0" &&
            !err.startsWith("Cairo traceback") &&
            !err.startsWith("Unknown location"),
        );

        // Use the meaningful error if found, otherwise use generic "Execution error"
        summary = meaningfulError || "Execution error";

        // Only update last error if we found something meaningful
        if (meaningfulError && meaningfulError !== "Execution error") {
          lastError[lastError.length - 1] = summary;
        }
      }
    }
  }

  return {
    raw: executionErrorRaw,
    summary: summaryOveride ? summaryOveride : capitalizeFirstLetter(summary),
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
        maxGasPrice?: bigint;
        actualGasPrice?: bigint;
        l1gasMaxAmount?: bigint;
        l1gasMaxPrice?: bigint;
        l1gasMaxFee?: bigint;
        l2GasMaxAmount?: bigint;
        l2GasActualUsed?: bigint;
      }
    | string;
} {
  if (typeof error.data === "string") {
    // Handle max fee exceeds balance case
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

    // Handle L1 gas bounds exceed balance case
    const l1GasBoundsMatch = error.data.match(
      /L1 gas bounds \(max amount: (\d+), max price: (\d+)\) exceed balance \((\d+)\)/,
    );
    if (l1GasBoundsMatch) {
      const l1gasMaxAmount = BigInt(l1GasBoundsMatch[1]);
      const l1gasMaxPrice = BigInt(l1GasBoundsMatch[2]);
      const balance = BigInt(l1GasBoundsMatch[3]);
      return {
        raw: error.data,
        summary: "Insufficient balance for transaction fee",
        details: {
          l1gasMaxAmount,
          l1gasMaxPrice,
          balance,
        },
      };
    }

    // Handle max gas price validation case
    const maxGasPriceMatch = error.data.match(
      /Max L1 gas price \((\d+)\) is lower than the actual gas price: (\d+)/,
    );
    if (maxGasPriceMatch) {
      const maxGasPrice = BigInt(maxGasPriceMatch[1]);
      const actualGasPrice = BigInt(maxGasPriceMatch[2]);
      return {
        raw: error.data,
        summary: "Estimated gas price too low",
        details: {
          maxGasPrice,
          actualGasPrice,
        },
      };
    }

    // Handle StarknetError with insufficient max L2Gas
    const l2GasMatch = error.data.match(
      /Insufficient max L2Gas: max amount: (\d+), actual used: (\d+)/,
    );
    if (l2GasMatch) {
      const l2GasMaxAmount = BigInt(l2GasMatch[1]);
      const l2GasActualUsed = BigInt(l2GasMatch[2]);
      return {
        raw: error.data,
        summary: "Insufficient max L2 gas amount",
        details: {
          l2GasMaxAmount,
          l2GasActualUsed,
        },
      };
    }
  }

  return {
    raw: error.data || JSON.stringify(error),
    summary: "Account validation failed",
    details: error.message || "Unknown validation error",
  };
}

// Test case for the specific JSON-RPC error from wasm bundle
export const jsonRpcExecutionErrorTestCase = {
  input: {
    code: 41,
    message: "Transaction execution error",
    data: {
      execution_error:
        "Transaction reverted: Transaction execution has failed:\n0: Error in the called contract (contract address: 0x0089fd6e04b5026c017785989d025252b9c52cd00bdf287aac1070c079ea3007, class hash: 0x0743c83c41ce99ad470aa308823f417b2141e02e04571f5c0004e743556e7faf, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nError at pc=0:17104:\nCairo traceback (most recent call last):\nUnknown location (pc=0:351)\nUnknown location (pc=0:6112)\nUnknown location (pc=0:17122)\n\n1: Error in the called contract (contract address: 0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d, class hash: 0x00a2475bc66197c751d854ea8c39c6ad9781eb284103bcd856b58e6b500078ac, selector: 0x0083afd3f4caedc6eebf44246fe54e38c95e3179a5ec9ea81740eca5b482d12e):\nError message: SafeUint256: subtraction overflow\nError at pc=0:347:\nCairo traceback (most recent call last):\nUnknown location (pc=0:1349)\nUnknown location (pc=0:1328)\nUnknown location (pc=0:721)\nError message: ERC20: transfer amount exceeds balance\nUnknown location (pc=0:902)\n\nAn ASSERT_EQ instruction failed: 0 != 1.\n",
    },
  },
  expected: {
    summary: "Insufficient token balance",
    stack: [
      {
        address:
          "0x0089fd6e04b5026c017785989d025252b9c52cd00bdf287aac1070c079ea3007",
        class:
          "0x0743c83c41ce99ad470aa308823f417b2141e02e04571f5c0004e743556e7faf",
        selector:
          "0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad",
        error: [
          "Cairo traceback (most recent call last):",
          "Unknown location (pc=0:351)",
          "Unknown location (pc=0:6112)",
          "Unknown location (pc=0:17122)",
        ],
      },
      {
        address:
          "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
        class:
          "0x00a2475bc66197c751d854ea8c39c6ad9781eb284103bcd856b58e6b500078ac",
        selector:
          "0x0083afd3f4caedc6eebf44246fe54e38c95e3179a5ec9ea81740eca5b482d12e",
        error: [
          "Error message: SafeUint256: subtraction overflow",
          "Cairo traceback (most recent call last):",
          "Unknown location (pc=0:1349)",
          "Unknown location (pc=0:1328)",
          "Unknown location (pc=0:721)",
          "Error message: ERC20: transfer amount exceeds balance",
          "Unknown location (pc=0:902)",
          "An ASSERT_EQ instruction failed: 0 != 1.",
        ],
      },
    ],
  },
};

export const starknetTransactionExecutionErrorTestCases = [
  {
    input: {
      code: 41,
      message: "Transaction execution error",
      data: {
        transaction_index: 0,
        execution_error:
          "Transaction reverted: Transaction execution has failed:\n0: Error in the called contract (contract address: 0x057156ef71dcfb930a272923dcbdc54392b6676497fdc143042ee1d4a7a861c1, class hash: 0x00e2eb8f5672af4e6a4e8a8f1b44989685e668489b0a25437733756c5a34a1d6, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nExecution failed. Failure reason:\n(0x617267656e742f6d756c746963616c6c2d6661696c6564 ('argent/multicall-failed'), 0x2, 0x736561736f6e206973207374696c6c206f70656e6564 ('season is still opened'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED')).\n",
      },
    },
    expected: {
      raw: "Transaction reverted: Transaction execution has failed:\n0: Error in the called contract (contract address: 0x057156ef71dcfb930a272923dcbdc54392b6676497fdc143042ee1d4a7a861c1, class hash: 0x00e2eb8f5672af4e6a4e8a8f1b44989685e668489b0a25437733756c5a34a1d6, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nExecution failed. Failure reason:\n(0x617267656e742f6d756c746963616c6c2d6661696c6564 ('argent/multicall-failed'), 0x2, 0x736561736f6e206973207374696c6c206f70656e6564 ('season is still opened'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED')).\n",
      summary: "Season is still opened",
      stack: [
        {
          address:
            "0x057156ef71dcfb930a272923dcbdc54392b6676497fdc143042ee1d4a7a861c1",
          class:
            "0x00e2eb8f5672af4e6a4e8a8f1b44989685e668489b0a25437733756c5a34a1d6",
          selector:
            "0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad",
          error: ["season is still opened"],
        },
      ],
    },
  },
  {
    input: {
      message: "Unexpected Error",
      data: { some_other_field: "some value" },
    },
    expected: {
      raw: '{"some_other_field":"some value"}',
      summary: "Unexpected Error",
      stack: [],
    },
  },
  {
    input: {
      message: "Execution error",
      data: {
        execution_error:
          "Transaction reverted: Transaction execution has failed:\n0: Error in the called contract (contract address: 0x02027fbc303fb8e3b2ac09a9d6e3cfe4b3085fe3d9b07900e282cbc9868a8226, class hash: 0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nError at pc=0:14785:\nCairo traceback (most recent call last):\nUnknown location (pc=0:351)\nUnknown location (pc=0:5795)\n\n1: Error in the called contract (contract address: 0x036486801b8f42e950824cba55b2df8cccb0af2497992f807a7e1d9abd2c6ba1, class hash: 0x0000000000000000000000000000000000000000000000000000000000000000, selector: 0x00e166029724b7a6bdc8fec815d48f7b1fe1dada0f096affffb3143be9bcdcef):\nRequested contract address 0x036486801b8f42e950824cba55b2df8cccb0af2497992f807a7e1d9abd2c6ba1 is not deployed.\n",
        transaction_index: 0,
      },
    },
    expected: {
      raw: "Transaction reverted: Transaction execution has failed:\n0: Error in the called contract (contract address: 0x02027fbc303fb8e3b2ac09a9d6e3cfe4b3085fe3d9b07900e282cbc9868a8226, class hash: 0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nError at pc=0:14785:\nCairo traceback (most recent call last):\nUnknown location (pc=0:351)\nUnknown location (pc=0:5795)\n\n1: Error in the called contract (contract address: 0x036486801b8f42e950824cba55b2df8cccb0af2497992f807a7e1d9abd2c6ba1, class hash: 0x0000000000000000000000000000000000000000000000000000000000000000, selector: 0x00e166029724b7a6bdc8fec815d48f7b1fe1dada0f096affffb3143be9bcdcef):\nRequested contract address 0x036486801b8f42e950824cba55b2df8cccb0af2497992f807a7e1d9abd2c6ba1 is not deployed.\n",
      summary: "Contract not deployed.",
      stack: [
        {
          address:
            "0x02027fbc303fb8e3b2ac09a9d6e3cfe4b3085fe3d9b07900e282cbc9868a8226",
          class:
            "0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab",
          error: [
            "Cairo traceback (most recent call last):",
            "Unknown location (pc=0:351)",
            "Unknown location (pc=0:5795)",
          ],
          selector:
            "0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad",
        },
        {
          address:
            "0x036486801b8f42e950824cba55b2df8cccb0af2497992f807a7e1d9abd2c6ba1",
          error: ["Contract not deployed."],
          selector:
            "0x00e166029724b7a6bdc8fec815d48f7b1fe1dada0f096affffb3143be9bcdcef",
        },
      ],
    },
  },
  {
    input: {
      message: "Execution error",
      data: {
        execution_error:
          "Transaction reverted: Transaction execution has failed:\n0: Error in the called contract (contract address: 0x02027fbc303fb8e3b2ac09a9d6e3cfe4b3085fe3d9b07900e282cbc9868a8226, class hash: 0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nError at pc=0:14785:\nCairo traceback (most recent call last):\nUnknown location (pc=0:351)\nUnknown location (pc=0:5795)\n\n1: Error in the called contract (contract address: 0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7, class hash: 0x02a8846878b6ad1f54f6ba46f5f40e11cee755c677f130b2c4b60566c9003f1f, selector: 0x0219209e083275171774dab1df80982e9df2096516f06319c5c6d71ae0a8480c):\nError at pc=0:1354:\nAn ASSERT_EQ instruction failed: 5:3 != 5:0.\n",
        transaction_index: 0,
      },
    },
    expected: {
      raw: "Transaction reverted: Transaction execution has failed:\n0: Error in the called contract (contract address: 0x02027fbc303fb8e3b2ac09a9d6e3cfe4b3085fe3d9b07900e282cbc9868a8226, class hash: 0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nError at pc=0:14785:\nCairo traceback (most recent call last):\nUnknown location (pc=0:351)\nUnknown location (pc=0:5795)\n\n1: Error in the called contract (contract address: 0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7, class hash: 0x02a8846878b6ad1f54f6ba46f5f40e11cee755c677f130b2c4b60566c9003f1f, selector: 0x0219209e083275171774dab1df80982e9df2096516f06319c5c6d71ae0a8480c):\nError at pc=0:1354:\nAn ASSERT_EQ instruction failed: 5:3 != 5:0.\n",
      summary: "Assertion failed in contract.",
      stack: [
        {
          address:
            "0x02027fbc303fb8e3b2ac09a9d6e3cfe4b3085fe3d9b07900e282cbc9868a8226",
          class:
            "0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab",
          error: [
            "Cairo traceback (most recent call last):",
            "Unknown location (pc=0:351)",
            "Unknown location (pc=0:5795)",
          ],
          selector:
            "0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad",
        },
        {
          address:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          class:
            "0x02a8846878b6ad1f54f6ba46f5f40e11cee755c677f130b2c4b60566c9003f1f",
          error: ["An ASSERT_EQ instruction failed: 5:3 != 5:0."],
          selector:
            "0x0219209e083275171774dab1df80982e9df2096516f06319c5c6d71ae0a8480c",
        },
      ],
    },
  },
  {
    input: {
      message: "Execution error",
      data: {
        execution_error:
          "Transaction reverted: Transaction execution has failed:\n0: Error in the called contract (contract address: 0x02027fbc303fb8e3b2ac09a9d6e3cfe4b3085fe3d9b07900e282cbc9868a8226, class hash: 0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nError at pc=0:14785:\nCairo traceback (most recent call last):\nUnknown location (pc=0:351)\nUnknown location (pc=0:5795)\n\n1: Error in the called contract (contract address: 0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7, class hash: 0x02a8846878b6ad1f54f6ba46f5f40e11cee755c677f130b2c4b60566c9003f1f, selector: 0x0219209e083275171774dab1df80982e9df2096516f06319c5c6d71ae0a8480c):\nError at pc=0:192:\nCairo traceback (most recent call last):\nUnknown location (pc=0:1361)\nUnknown location (pc=0:1340)\nError message: ERC20: amount is not a valid Uint256\nUnknown location (pc=0:750)\n\nRange-check validation failed, number 4291026117947750527606861672462094693314608 is out of valid range [0, 340282366920938463463374607431768211456]\n",
        transaction_index: 0,
      },
    },
    expected: {
      raw: "Transaction reverted: Transaction execution has failed:\n0: Error in the called contract (contract address: 0x02027fbc303fb8e3b2ac09a9d6e3cfe4b3085fe3d9b07900e282cbc9868a8226, class hash: 0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nError at pc=0:14785:\nCairo traceback (most recent call last):\nUnknown location (pc=0:351)\nUnknown location (pc=0:5795)\n\n1: Error in the called contract (contract address: 0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7, class hash: 0x02a8846878b6ad1f54f6ba46f5f40e11cee755c677f130b2c4b60566c9003f1f, selector: 0x0219209e083275171774dab1df80982e9df2096516f06319c5c6d71ae0a8480c):\nError at pc=0:192:\nCairo traceback (most recent call last):\nUnknown location (pc=0:1361)\nUnknown location (pc=0:1340)\nError message: ERC20: amount is not a valid Uint256\nUnknown location (pc=0:750)\n\nRange-check validation failed, number 4291026117947750527606861672462094693314608 is out of valid range [0, 340282366920938463463374607431768211456]\n",
      summary: "Invalid token amount.",
      stack: [
        {
          address:
            "0x02027fbc303fb8e3b2ac09a9d6e3cfe4b3085fe3d9b07900e282cbc9868a8226",
          class:
            "0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab",
          error: [
            "Cairo traceback (most recent call last):",
            "Unknown location (pc=0:351)",
            "Unknown location (pc=0:5795)",
          ],
          selector:
            "0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad",
        },
        {
          address:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          class:
            "0x02a8846878b6ad1f54f6ba46f5f40e11cee755c677f130b2c4b60566c9003f1f",
          error: [
            "Cairo traceback (most recent call last):",
            "Unknown location (pc=0:1361)",
            "Unknown location (pc=0:1340)",
            "Error message: ERC20: amount is not a valid Uint256",
            "Unknown location (pc=0:750)",
            "Range-check validation failed, number 4291026117947750527606861672462094693314608 is out of valid range [0, 340282366920938463463374607431768211456]",
          ],
          selector:
            "0x0219209e083275171774dab1df80982e9df2096516f06319c5c6d71ae0a8480c",
        },
      ],
    },
  },
  {
    input: {
      message: "Transaction execution error",
      data: {
        execution_error:
          "Transaction reverted: Transaction execution has failed:\n0: Error in the called contract (contract address: 0x00eeca9141c6f3f3d4664da9521397e3c1df155ea41af91bd7a9e96ffee5681a, class hash: 0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nError at pc=0:14785:\nCairo traceback (most recent call last):\nUnknown location (pc=0:351)\nUnknown location (pc=0:5795)\n\n1: Error in the called contract (contract address: 0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7, class hash: 0x02a8846878b6ad1f54f6ba46f5f40e11cee755c677f130b2c4b60566c9003f1f, selector: 0x0183420eb7aafd9caad318b543d9252c94857340f4768ac83cf4b6472f0bf515):\nEntry point EntryPointSelector(0x183420eb7aafd9caad318b543d9252c94857340f4768ac83cf4b6472f0bf515) not found in contract.\n",
        transaction_index: 0,
      },
    },
    expected: {
      raw: "Transaction reverted: Transaction execution has failed:\n0: Error in the called contract (contract address: 0x00eeca9141c6f3f3d4664da9521397e3c1df155ea41af91bd7a9e96ffee5681a, class hash: 0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nError at pc=0:14785:\nCairo traceback (most recent call last):\nUnknown location (pc=0:351)\nUnknown location (pc=0:5795)\n\n1: Error in the called contract (contract address: 0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7, class hash: 0x02a8846878b6ad1f54f6ba46f5f40e11cee755c677f130b2c4b60566c9003f1f, selector: 0x0183420eb7aafd9caad318b543d9252c94857340f4768ac83cf4b6472f0bf515):\nEntry point EntryPointSelector(0x183420eb7aafd9caad318b543d9252c94857340f4768ac83cf4b6472f0bf515) not found in contract.\n",
      summary: "Function not found in the contract.",
      stack: [
        {
          address:
            "0x00eeca9141c6f3f3d4664da9521397e3c1df155ea41af91bd7a9e96ffee5681a",
          class:
            "0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab",
          error: [
            "Cairo traceback (most recent call last):",
            "Unknown location (pc=0:351)",
            "Unknown location (pc=0:5795)",
          ],
          selector:
            "0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad",
        },
        {
          address:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          class:
            "0x02a8846878b6ad1f54f6ba46f5f40e11cee755c677f130b2c4b60566c9003f1f",
          error: ["Function not found in the contract."],
          selector:
            "0x0183420eb7aafd9caad318b543d9252c94857340f4768ac83cf4b6472f0bf515",
        },
      ],
    },
  },
  {
    input: {
      message: "Transaction validation error",
      data: {
        execution_error:
          "Transaction validation error: Requested contract address 0x013f1386e3d4267a1502d8ca782d34b63634d969d3c527a511814c2ef67b84c4 is not deployed.",
      },
    },
    expected: {
      raw: "Transaction validation error: Requested contract address 0x013f1386e3d4267a1502d8ca782d34b63634d969d3c527a511814c2ef67b84c4 is not deployed.",
      summary: "Contract not deployed.",
      stack: [
        {
          address:
            "0x013f1386e3d4267a1502d8ca782d34b63634d969d3c527a511814c2ef67b84c4",
          error: ["Contract not deployed."],
        },
      ],
    },
  },
  {
    input: {
      message: "Transaction execution error",
      data: {
        execution_error:
          "Transaction reverted: Transaction execution has failed:\n0: Error in the called contract (contract address: 0x06bd82a20984e638c8e1d45770e2924e274e315b9609eb15c26384eac0094cf1, class hash: 0x05400e90f7e0ae78bd02c77cd75527280470e2fe19c54970dd79dc37a9d3645c, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nError at pc=0:4573:\nCairo traceback (most recent call last):\nUnknown location (pc=0:67)\nUnknown location (pc=0:1835)\nUnknown location (pc=0:2478)\nUnknown location (pc=0:3255)\nUnknown location (pc=0:3809)\nUnknown location (pc=0:3795)\n\n1: Error in the called contract (contract address: 0x02c2c319b7e3d63afe863f003258b7e2ab3a6ccf5727914e619ad905ce5f8080, class hash: 0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab, selector: 0x034cc13b274446654ca3233ed2c1620d4c5d1d32fd20b47146a3371064bdc57d):\nExecution failed. Failure reason: 0x617267656e742f696e76616c69642d74696d657374616d70 ('argent/invalid-timestamp').\n",
        transaction_index: 0,
      },
    },
    expected: {
      raw: "Transaction reverted: Transaction execution has failed:\n0: Error in the called contract (contract address: 0x06bd82a20984e638c8e1d45770e2924e274e315b9609eb15c26384eac0094cf1, class hash: 0x05400e90f7e0ae78bd02c77cd75527280470e2fe19c54970dd79dc37a9d3645c, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nError at pc=0:4573:\nCairo traceback (most recent call last):\nUnknown location (pc=0:67)\nUnknown location (pc=0:1835)\nUnknown location (pc=0:2478)\nUnknown location (pc=0:3255)\nUnknown location (pc=0:3809)\nUnknown location (pc=0:3795)\n\n1: Error in the called contract (contract address: 0x02c2c319b7e3d63afe863f003258b7e2ab3a6ccf5727914e619ad905ce5f8080, class hash: 0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab, selector: 0x034cc13b274446654ca3233ed2c1620d4c5d1d32fd20b47146a3371064bdc57d):\nExecution failed. Failure reason: 0x617267656e742f696e76616c69642d74696d657374616d70 ('argent/invalid-timestamp').\n",
      summary: "Invalid paymaster transaction timestamp",
      stack: [
        {
          address:
            "0x06bd82a20984e638c8e1d45770e2924e274e315b9609eb15c26384eac0094cf1",
          class:
            "0x05400e90f7e0ae78bd02c77cd75527280470e2fe19c54970dd79dc37a9d3645c",
          error: [
            "Cairo traceback (most recent call last):",
            "Unknown location (pc=0:67)",
            "Unknown location (pc=0:1835)",
            "Unknown location (pc=0:2478)",
            "Unknown location (pc=0:3255)",
            "Unknown location (pc=0:3809)",
            "Unknown location (pc=0:3795)",
          ],
          selector:
            "0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad",
        },
        {
          address:
            "0x02c2c319b7e3d63afe863f003258b7e2ab3a6ccf5727914e619ad905ce5f8080",
          class:
            "0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab",
          error: ["Invalid paymaster transaction timestamp"],
          selector:
            "0x034cc13b274446654ca3233ed2c1620d4c5d1d32fd20b47146a3371064bdc57d",
        },
      ],
    },
  },
  {
    input: {
      code: 41,
      message: "Transaction execution error",
      data: {
        execution_error:
          "Transaction reverted: Transaction execution has failed:\n0: Error in the called contract (contract address: 0x057156ef71dcfb930a272923dcbdc54392b6676497fdc143042ee1d4a7a861c1, class hash: 0x00e2eb8f5672af4e6a4e8a8f1b44989685e668489b0a25437733756c5a34a1d6, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nError at pc=0:4302:\nCairo traceback (most recent call last):\nUnknown location (pc=0:290)\nUnknown location (pc=0:3037)\n\n1: Error in the called contract (contract address: 0x02c2c319b7e3d63afe863f003258b7e2ab3a6ccf5727914e619ad905ce5f8080, class hash: 0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab, selector: 0x034cc13b274446654ca3233ed2c1620d4c5d1d32fd20b47146a3371064bdc57d):\nError at pc=0:14785:\nCairo traceback (most recent call last):\nUnknown location (pc=0:3273)\nUnknown location (pc=0:12490)\n\n2: Error in the called contract (contract address: 0x02c2c319b7e3d63afe863f003258b7e2ab3a6ccf5727914e619ad905ce5f8080, class hash: 0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab, selector: 0x013f6fcb09682fd385a29ed9e333d48be50ed8245d540ecd221d510555344456):\nExecution failed. Failure reason: 0x73657373696f6e2f616c72656164792d72656769737465726564 ('session/already-registered').\n",
        transaction_index: 0,
      },
    },
    expected: {
      raw: "Transaction reverted: Transaction execution has failed:\n0: Error in the called contract (contract address: 0x057156ef71dcfb930a272923dcbdc54392b6676497fdc143042ee1d4a7a861c1, class hash: 0x00e2eb8f5672af4e6a4e8a8f1b44989685e668489b0a25437733756c5a34a1d6, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nError at pc=0:4302:\nCairo traceback (most recent call last):\nUnknown location (pc=0:290)\nUnknown location (pc=0:3037)\n\n1: Error in the called contract (contract address: 0x02c2c319b7e3d63afe863f003258b7e2ab3a6ccf5727914e619ad905ce5f8080, class hash: 0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab, selector: 0x034cc13b274446654ca3233ed2c1620d4c5d1d32fd20b47146a3371064bdc57d):\nError at pc=0:14785:\nCairo traceback (most recent call last):\nUnknown location (pc=0:3273)\nUnknown location (pc=0:12490)\n\n2: Error in the called contract (contract address: 0x02c2c319b7e3d63afe863f003258b7e2ab3a6ccf5727914e619ad905ce5f8080, class hash: 0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab, selector: 0x013f6fcb09682fd385a29ed9e333d48be50ed8245d540ecd221d510555344456):\nExecution failed. Failure reason: 0x73657373696f6e2f616c72656164792d72656769737465726564 ('session/already-registered').\n",
      summary: "Session already registered",
      stack: [
        {
          address:
            "0x057156ef71dcfb930a272923dcbdc54392b6676497fdc143042ee1d4a7a861c1",
          class:
            "0x00e2eb8f5672af4e6a4e8a8f1b44989685e668489b0a25437733756c5a34a1d6",
          error: [
            "Cairo traceback (most recent call last):",
            "Unknown location (pc=0:290)",
            "Unknown location (pc=0:3037)",
          ],
          selector:
            "0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad",
        },
        {
          address:
            "0x02c2c319b7e3d63afe863f003258b7e2ab3a6ccf5727914e619ad905ce5f8080",
          class:
            "0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab",
          error: [
            "Cairo traceback (most recent call last):",
            "Unknown location (pc=0:3273)",
            "Unknown location (pc=0:12490)",
          ],
          selector:
            "0x034cc13b274446654ca3233ed2c1620d4c5d1d32fd20b47146a3371064bdc57d",
        },
        {
          address:
            "0x02c2c319b7e3d63afe863f003258b7e2ab3a6ccf5727914e619ad905ce5f8080",
          class:
            "0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab",
          error: ["Session already registered"],
          selector:
            "0x013f6fcb09682fd385a29ed9e333d48be50ed8245d540ecd221d510555344456",
        },
      ],
    },
  },
  {
    input: {
      code: 41,
      message: "Transaction execution error",
      data: {
        execution_error:
          "Transaction reverted: Transaction execution has failed:\n0: Error in the called contract (contract address: 0x0457af6b611a8d3672b72188619a9959d7e3dc74282b6a94c008b252f03226c1, class hash: 0x00e2eb8f5672af4e6a4e8a8f1b44989685e668489b0a25437733756c5a34a1d6, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nError at pc=0:4302:\nCairo traceback (most recent call last):\nUnknown location (pc=0:290)\nUnknown location (pc=0:3037)\n\n1: Error in the called contract (contract address: 0x052cc7e8d2e145f306c05509b954e7e63bdb9298a89f2068d528e3bdbde48b3c, class hash: 0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab, selector: 0x034cc13b274446654ca3233ed2c1620d4c5d1d32fd20b47146a3371064bdc57d):\nError at pc=0:14785:\nCairo traceback (most recent call last):\nUnknown location (pc=0:3273)\nUnknown location (pc=0:12490)\n\n2: Error in the called contract (contract address: 0x018108b32cea514a78ef1b0e4a0753e855cdf620bc0565202c02456f618c4dc4, class hash: 0x026b25c3a9bf7582cc8a9e6fff378cb649fc5cba404f93633ed41d59053dcd31, selector: 0x02d1af4265f4530c75b41282ed3b71617d3d435e96fe13b08848482173692f4f):\nExecution failed. Failure reason: 0x4e6f7420617574686f72697a656420746f20616374 ('Not authorized to act').\n",
        transaction_index: 0,
      },
    },
    expected: {
      raw: "Transaction reverted: Transaction execution has failed:\n0: Error in the called contract (contract address: 0x0457af6b611a8d3672b72188619a9959d7e3dc74282b6a94c008b252f03226c1, class hash: 0x00e2eb8f5672af4e6a4e8a8f1b44989685e668489b0a25437733756c5a34a1d6, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nError at pc=0:4302:\nCairo traceback (most recent call last):\nUnknown location (pc=0:290)\nUnknown location (pc=0:3037)\n\n1: Error in the called contract (contract address: 0x052cc7e8d2e145f306c05509b954e7e63bdb9298a89f2068d528e3bdbde48b3c, class hash: 0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab, selector: 0x034cc13b274446654ca3233ed2c1620d4c5d1d32fd20b47146a3371064bdc57d):\nError at pc=0:14785:\nCairo traceback (most recent call last):\nUnknown location (pc=0:3273)\nUnknown location (pc=0:12490)\n\n2: Error in the called contract (contract address: 0x018108b32cea514a78ef1b0e4a0753e855cdf620bc0565202c02456f618c4dc4, class hash: 0x026b25c3a9bf7582cc8a9e6fff378cb649fc5cba404f93633ed41d59053dcd31, selector: 0x02d1af4265f4530c75b41282ed3b71617d3d435e96fe13b08848482173692f4f):\nExecution failed. Failure reason: 0x4e6f7420617574686f72697a656420746f20616374 ('Not authorized to act').\n",
      summary: "Not authorized to act",
      stack: [
        {
          address:
            "0x0457af6b611a8d3672b72188619a9959d7e3dc74282b6a94c008b252f03226c1",
          class:
            "0x00e2eb8f5672af4e6a4e8a8f1b44989685e668489b0a25437733756c5a34a1d6",
          error: [
            "Cairo traceback (most recent call last):",
            "Unknown location (pc=0:290)",
            "Unknown location (pc=0:3037)",
          ],
          selector:
            "0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad",
        },
        {
          address:
            "0x052cc7e8d2e145f306c05509b954e7e63bdb9298a89f2068d528e3bdbde48b3c",
          class:
            "0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab",
          error: [
            "Cairo traceback (most recent call last):",
            "Unknown location (pc=0:3273)",
            "Unknown location (pc=0:12490)",
          ],
          selector:
            "0x034cc13b274446654ca3233ed2c1620d4c5d1d32fd20b47146a3371064bdc57d",
        },
        {
          address:
            "0x018108b32cea514a78ef1b0e4a0753e855cdf620bc0565202c02456f618c4dc4",
          class:
            "0x026b25c3a9bf7582cc8a9e6fff378cb649fc5cba404f93633ed41d59053dcd31",
          error: ["Not authorized to act"],
          selector:
            "0x02d1af4265f4530c75b41282ed3b71617d3d435e96fe13b08848482173692f4f",
        },
      ],
    },
  },
  {
    input: {
      code: 41,
      message: "Transaction execution error",
      data: {
        execution_error:
          "Transaction execution has failed:\n0: Error in the called contract (contract address: 0x01432eafe3cc07b269b1ef34f0438ff9cbbc4384fa3fe78f53e0eb3352f4ce10, class hash: 0x00e2eb8f5672af4e6a4e8a8f1b44989685e668489b0a25437733756c5a34a1d6, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nError at pc=0:4302:\nCairo traceback (most recent call last):\nUnknown location (pc=0:290)\nUnknown location (pc=0:3037)\n\n1: Error in the called contract (contract address: 0x076bd69406bce444e6f872e3939a4230e7a5dd73cbd50f0ec7d2a304f7d1c1b7, class hash: 0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab, selector: 0x034cc13b274446654ca3233ed2c1620d4c5d1d32fd20b47146a3371064bdc57d):\nError at pc=0:14785:\nCairo traceback (most recent call last):\nUnknown location (pc=0:3273)\nUnknown location (pc=0:12490)\n\n2: Error in the called contract (contract address: 0x018108b32cea514a78ef1b0e4a0753e855cdf620bc0565202c02456f618c4dc4, class hash: 0x026b25c3a9bf7582cc8a9e6fff378cb649fc5cba404f93633ed41d59053dcd31, selector: 0x00f2f7c15cbe06c8d94597cd91fd7f3369eae842359235712def5584f8d270cd):\nExecution failed. Failure reason: 0x4261672069732066756c6c ('Bag is full').\n",
        transaction_index: 0,
      },
    },
    expected: {
      raw: "Transaction execution has failed:\n0: Error in the called contract (contract address: 0x01432eafe3cc07b269b1ef34f0438ff9cbbc4384fa3fe78f53e0eb3352f4ce10, class hash: 0x00e2eb8f5672af4e6a4e8a8f1b44989685e668489b0a25437733756c5a34a1d6, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nError at pc=0:4302:\nCairo traceback (most recent call last):\nUnknown location (pc=0:290)\nUnknown location (pc=0:3037)\n\n1: Error in the called contract (contract address: 0x076bd69406bce444e6f872e3939a4230e7a5dd73cbd50f0ec7d2a304f7d1c1b7, class hash: 0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab, selector: 0x034cc13b274446654ca3233ed2c1620d4c5d1d32fd20b47146a3371064bdc57d):\nError at pc=0:14785:\nCairo traceback (most recent call last):\nUnknown location (pc=0:3273)\nUnknown location (pc=0:12490)\n\n2: Error in the called contract (contract address: 0x018108b32cea514a78ef1b0e4a0753e855cdf620bc0565202c02456f618c4dc4, class hash: 0x026b25c3a9bf7582cc8a9e6fff378cb649fc5cba404f93633ed41d59053dcd31, selector: 0x00f2f7c15cbe06c8d94597cd91fd7f3369eae842359235712def5584f8d270cd):\nExecution failed. Failure reason: 0x4261672069732066756c6c ('Bag is full').\n",
      summary: "Bag is full",
      stack: [
        {
          address:
            "0x01432eafe3cc07b269b1ef34f0438ff9cbbc4384fa3fe78f53e0eb3352f4ce10",
          class:
            "0x00e2eb8f5672af4e6a4e8a8f1b44989685e668489b0a25437733756c5a34a1d6",
          error: [
            "Cairo traceback (most recent call last):",
            "Unknown location (pc=0:290)",
            "Unknown location (pc=0:3037)",
          ],
          selector:
            "0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad",
        },
        {
          address:
            "0x076bd69406bce444e6f872e3939a4230e7a5dd73cbd50f0ec7d2a304f7d1c1b7",
          class:
            "0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab",
          error: [
            "Cairo traceback (most recent call last):",
            "Unknown location (pc=0:3273)",
            "Unknown location (pc=0:12490)",
          ],
          selector:
            "0x034cc13b274446654ca3233ed2c1620d4c5d1d32fd20b47146a3371064bdc57d",
        },
        {
          address:
            "0x018108b32cea514a78ef1b0e4a0753e855cdf620bc0565202c02456f618c4dc4",
          class:
            "0x026b25c3a9bf7582cc8a9e6fff378cb649fc5cba404f93633ed41d59053dcd31",
          error: ["Bag is full"],
          selector:
            "0x00f2f7c15cbe06c8d94597cd91fd7f3369eae842359235712def5584f8d270cd",
        },
      ],
    },
  },
  {
    input: {
      message: "Transaction execution error",
      data: {
        execution_error:
          "Contract constructor execution error: Error in the contract class 1036468786485603263651305108470035619564775139775542482344058180278592653739 constructor (selector: Some(EntryPointSelector(0x28ffe4ff0f226a9107253e17a904099aa4f63a02a5621de0576e5aa71bc5194)), address: ContractAddress(PatriciaKey(0x5bc6a67cfd7edef68c10eb2100091a01ea7e5b9f01443e1d3cf7c23a084d7da))): Execution failed. Failure reason: 0x4661696c656420746f20646573657269616c697a6520706172616d202331 ('Failed to deserialize param #1').",
        transaction_index: 0,
      },
    },
    expected: {
      raw: "Contract constructor execution error: Error in the contract class 1036468786485603263651305108470035619564775139775542482344058180278592653739 constructor (selector: Some(EntryPointSelector(0x28ffe4ff0f226a9107253e17a904099aa4f63a02a5621de0576e5aa71bc5194)), address: ContractAddress(PatriciaKey(0x5bc6a67cfd7edef68c10eb2100091a01ea7e5b9f01443e1d3cf7c23a084d7da))): Execution failed. Failure reason: 0x4661696c656420746f20646573657269616c697a6520706172616d202331 ('Failed to deserialize param #1').",
      summary: "Contract constructor error",
      stack: [
        {
          address:
            "0x5bc6a67cfd7edef68c10eb2100091a01ea7e5b9f01443e1d3cf7c23a084d7da",
          class:
            "0x24a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab",
          error: ["Failed to deserialize param #1"],
          selector:
            "0x28ffe4ff0f226a9107253e17a904099aa4f63a02a5621de0576e5aa71bc5194",
        },
      ],
    },
  },
  {
    input: {
      code: 41,
      message: "Transaction execution error",
      data: {
        execution_error: {
          class_hash:
            "0x743c83c41ce99ad470aa308823f417b2141e02e04571f5c0004e743556e7faf",
          contract_address:
            "0x4fdcb829582d172a6f3858b97c16da38b08da5a1df7101a5d285b868d89921b",
          error:
            "(0x617267656e742f6d756c746963616c6c2d6661696c6564 ('argent/multicall-failed'), 0x1, 0x753235365f737562204f766572666c6f77 ('u256_sub Overflow'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'))",
          selector:
            "0x15d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad",
        },
        transaction_index: 0,
      },
    },
    expected: {
      raw: '{"class_hash":"0x743c83c41ce99ad470aa308823f417b2141e02e04571f5c0004e743556e7faf","contract_address":"0x4fdcb829582d172a6f3858b97c16da38b08da5a1df7101a5d285b868d89921b","error":"(0x617267656e742f6d756c746963616c6c2d6661696c6564 (\'argent/multicall-failed\'), 0x1, 0x753235365f737562204f766572666c6f77 (\'u256_sub Overflow\'), 0x454e545259504f494e545f4641494c4544 (\'ENTRYPOINT_FAILED\'))","selector":"0x15d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad"}',
      summary: "U256_sub Overflow",
      stack: [
        {
          address:
            "0x4fdcb829582d172a6f3858b97c16da38b08da5a1df7101a5d285b868d89921b",
          class:
            "0x743c83c41ce99ad470aa308823f417b2141e02e04571f5c0004e743556e7faf",
          error: ["u256_sub Overflow"],
          selector:
            "0x15d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad",
        },
      ],
    },
  },
  {
    input: {
      code: 41,
      message: "Transaction execution error",
      data: {
        execution_error:
          "Transaction execution has failed:\n0: Error in the called contract (contract address: 0x03f301af12fb7d7ed8266639594b1867c33b511824d2a1d6bc7fa25ea8eb477c, class hash: 0x0360783345096514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nExecution failed. Failure reason:\n(0x617267656e742f6d756c746963616c6c2d6661696c6564 ('argent/multicall-failed'), 0x0, 'Already joined in!', 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED')).\n",
        transaction_index: 0,
      },
    },
    expected: {
      raw: "Transaction execution has failed:\n0: Error in the called contract (contract address: 0x03f301af12fb7d7ed8266639594b1867c33b511824d2a1d6bc7fa25ea8eb477c, class hash: 0x0360783345096514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nExecution failed. Failure reason:\n(0x617267656e742f6d756c746963616c6c2d6661696c6564 ('argent/multicall-failed'), 0x0, 'Already joined in!', 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED')).\n",
      summary: "Already joined in!",
      stack: [
        {
          address:
            "0x03f301af12fb7d7ed8266639594b1867c33b511824d2a1d6bc7fa25ea8eb477c",
          class:
            "0x0360783345096514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f",
          selector:
            "0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad",
          error: ["Already joined in!"],
        },
      ],
    },
  },
  {
    input: {
      code: 41,
      message: "Transaction execution error",
      data: {
        transaction_index: 0,
        execution_error:
          "Contract address= 0x13f1386e3d4267a1502d8ca782d34b63634d969d3c527a511814c2ef67b84c4, Class hash= 0x743c83c41ce99ad470aa308823f417b2141e02e04571f5c0004e743556e7faf, Selector= 0x15d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad, Nested error: (0x617267656e742f6d756c746963616c6c2d6661696c6564 ('argent/multicall-failed'), 0x1, 0x45524332303a20696e73756666696369656e742062616c616e6365 ('ERC20: insufficient balance'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'), 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'))",
      },
    },
    expected: {
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
    },
  },
  {
    input: {
      code: 41,
      message: "Transaction execution error",
      data: {
        transaction_index: 0,
        execution_error:
          "Contract address= 0x596990bd2774a49a4a8578e9bae58b76fe82183088bfcc439226c8388b63c09, Class hash= 0x743c83c41ce99ad470aa308823f417b2141e02e04571f5c0004e743556e7faf, Selector= 0x15d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad, Nested error: (0x617267656e742f6d756c746963616c6c2d6661696c6564 ('argent/multicall-failed'), 0x1, \"Wallet Connection Required for Double or Nothing Spin\", 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'))",
      },
    },
    expected: {
      raw: "Contract address= 0x596990bd2774a49a4a8578e9bae58b76fe82183088bfcc439226c8388b63c09, Class hash= 0x743c83c41ce99ad470aa308823f417b2141e02e04571f5c0004e743556e7faf, Selector= 0x15d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad, Nested error: (0x617267656e742f6d756c746963616c6c2d6661696c6564 ('argent/multicall-failed'), 0x1, \"Wallet Connection Required for Double or Nothing Spin\", 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'))",
      summary: "Wallet Connection Required for Double or Nothing Spin",
      stack: [
        {
          address:
            "0x596990bd2774a49a4a8578e9bae58b76fe82183088bfcc439226c8388b63c09",
          class:
            "0x743c83c41ce99ad470aa308823f417b2141e02e04571f5c0004e743556e7faf",
          selector:
            "0x15d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad",
          error: ["Wallet Connection Required for Double or Nothing Spin"],
        },
      ],
    },
  },
  {
    input: {
      code: 41,
      message: "Transaction execution error",
      data: {
        transaction_index: 0,
        execution_error:
          "Transaction execution has failed:\n0: Error in the called contract (contract address: 0x013f1386e3d4267a1502d8ca782d34b63634d969d3c527a511814c2ef67b84c4, class hash: 0x0743c83c41ce99ad470aa308823f417b2141e02e04571f5c0004e743556e7faf, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nExecution failed. Failure reason:\n(0x617267656e742f6d756c746963616c6c2d6661696c6564 ('argent/multicall-failed'), 0x0 (''), \"Jackpot has ended\", 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED')).\n",
      },
    },
    expected: {
      raw: "Transaction execution has failed:\n0: Error in the called contract (contract address: 0x013f1386e3d4267a1502d8ca782d34b63634d969d3c527a511814c2ef67b84c4, class hash: 0x0743c83c41ce99ad470aa308823f417b2141e02e04571f5c0004e743556e7faf, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nExecution failed. Failure reason:\n(0x617267656e742f6d756c746963616c6c2d6661696c6564 ('argent/multicall-failed'), 0x0 (''), \"Jackpot has ended\", 0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED')).\n",
      summary: "Jackpot has ended",
      stack: [
        {
          address:
            "0x013f1386e3d4267a1502d8ca782d34b63634d969d3c527a511814c2ef67b84c4",
          class:
            "0x0743c83c41ce99ad470aa308823f417b2141e02e04571f5c0004e743556e7faf",
          selector:
            "0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad",
          error: ["Jackpot has ended"],
        },
      ],
    },
  },
  {
    input: {
      code: 41,
      message: "Transaction execution error",
      data: {
        transaction_index: 0,
        execution_error:
          "Contract address= 0x4c001bb4e136a2846d946fe14c6cd97fcccb29b7e3c4b994bd901463f24d60b, Class hash= 0xe2eb8f5672af4e6a4e8a8f1b44989685e668489b0a25437733756c5a34a1d6, Selector= 0x15d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad, Nested error: Contract address= 0x4c001bb4e136a2846d946fe14c6cd97fcccb29b7e3c4b994bd901463f24d60b, Class hash= 0xe2eb8f5672af4e6a4e8a8f1b44989685e668489b0a25437733756c5a34a1d6, Selector= 0x15d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad, Nested error: Contract address= 0x51fea4450da9d6aee758bdeba88b2f665bcbf549d2c61421aa724e9ac0ced8f, Class hash= 0x6982d79b2c1da29974bb766df7e642960ce61de0c4d6211adf1aa8a16ae32b6, Selector= 0x112b534028a89c7062d4f90ab082e3bb5a7c63c1af793c03bd040a66dc50839, Nested error: 0x56726650726f76696465723a206e6f7420636f6e73756d6564 ('VrfProvider: not consumed')",
      },
    },
    expected: {
      raw: "Contract address= 0x4c001bb4e136a2846d946fe14c6cd97fcccb29b7e3c4b994bd901463f24d60b, Class hash= 0xe2eb8f5672af4e6a4e8a8f1b44989685e668489b0a25437733756c5a34a1d6, Selector= 0x15d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad, Nested error: Contract address= 0x4c001bb4e136a2846d946fe14c6cd97fcccb29b7e3c4b994bd901463f24d60b, Class hash= 0xe2eb8f5672af4e6a4e8a8f1b44989685e668489b0a25437733756c5a34a1d6, Selector= 0x15d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad, Nested error: Contract address= 0x51fea4450da9d6aee758bdeba88b2f665bcbf549d2c61421aa724e9ac0ced8f, Class hash= 0x6982d79b2c1da29974bb766df7e642960ce61de0c4d6211adf1aa8a16ae32b6, Selector= 0x112b534028a89c7062d4f90ab082e3bb5a7c63c1af793c03bd040a66dc50839, Nested error: 0x56726650726f76696465723a206e6f7420636f6e73756d6564 ('VrfProvider: not consumed')",
      summary: "VrfProvider: not consumed",
      stack: [
        {
          address:
            "0x51fea4450da9d6aee758bdeba88b2f665bcbf549d2c61421aa724e9ac0ced8f",
          class:
            "0x6982d79b2c1da29974bb766df7e642960ce61de0c4d6211adf1aa8a16ae32b6",
          selector:
            "0x112b534028a89c7062d4f90ab082e3bb5a7c63c1af793c03bd040a66dc50839",
          error: ["VrfProvider: not consumed"],
        },
      ],
    },
  },
  {
    input: {
      code: 41,
      message: "Transaction execution error",
      data: {
        transaction_index: 0,
        execution_error:
          "Contract address= 0xabc123, Class hash= 0xdef456, Selector= 0x789012, Nested error: (0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'), 0x617267656e742f6d756c746963616c6c2d6661696c6564 ('argent/multicall-failed'), 0x454e545259504f494e545f4e4f545f464f554e44 ('ENTRYPOINT_NOT_FOUND'))",
      },
    },
    expected: {
      raw: "Contract address= 0xabc123, Class hash= 0xdef456, Selector= 0x789012, Nested error: (0x454e545259504f494e545f4641494c4544 ('ENTRYPOINT_FAILED'), 0x617267656e742f6d756c746963616c6c2d6661696c6564 ('argent/multicall-failed'), 0x454e545259504f494e545f4e4f545f464f554e44 ('ENTRYPOINT_NOT_FOUND'))",
      summary: "Transaction execution failed",
      stack: [
        {
          address: "0xabc123",
          class: "0xdef456",
          selector: "0x789012",
          error: [
            "ENTRYPOINT_FAILED",
            "argent/multicall-failed",
            "ENTRYPOINT_NOT_FOUND",
          ],
        },
      ],
    },
  },
  {
    input: {
      code: 41,
      message: "Transaction execution error",
      data: {
        transaction_index: 0,
        execution_error:
          "Contract address= 0x111222, Class hash= 0x333444, Selector= 0x555666, Nested error: ('ENTRYPOINT_FAILED', \"argent/multicall-failed\", 'ENTRYPOINT_NOT_FOUND')",
      },
    },
    expected: {
      raw: "Contract address= 0x111222, Class hash= 0x333444, Selector= 0x555666, Nested error: ('ENTRYPOINT_FAILED', \"argent/multicall-failed\", 'ENTRYPOINT_NOT_FOUND')",
      summary: "Transaction execution failed",
      stack: [
        {
          address: "0x111222",
          class: "0x333444",
          selector: "0x555666",
          error: [
            "ENTRYPOINT_FAILED",
            "ENTRYPOINT_NOT_FOUND",
            "argent/multicall-failed",
          ],
        },
      ],
    },
  },
];

export const starknetTransactionValidationErrorTestCases = [
  {
    input: {
      message: "Account validation failed",
      data: "Max L1 gas price (69174664530264) is lower than the actual gas price: 71824602546140.",
    },
    expected: {
      raw: "Max L1 gas price (69174664530264) is lower than the actual gas price: 71824602546140.",
      summary: "Estimated gas price too low",
      details: {
        maxGasPrice: 69174664530264n,
        actualGasPrice: 71824602546140n,
      },
    },
  },
  {
    input: {
      message: "Account validation failed",
      data: "L1 gas bounds (max amount: 7206, max price: 18106067943992) exceed balance (122941657491449276).",
    },
    expected: {
      raw: "L1 gas bounds (max amount: 7206, max price: 18106067943992) exceed balance (122941657491449276).",
      summary: "Insufficient balance for transaction fee",
      details: {
        l1gasMaxAmount: 7206n,
        l1gasMaxPrice: 18106067943992n,
        balance: 122941657491449276n,
      },
    },
  },
];

export const graphqlErrorTestCases = [
  {
    input:
      'GraphQL API error: GraphQLErrors([Error { message: "rpc error: code = NotFound desc = controller not found for user test on network SN_MAIN", locations: None, path: Some([Key("createSession")]), extensions: None }])',
    expected: {
      raw: 'GraphQL API error: GraphQLErrors([Error { message: "rpc error: code = NotFound desc = controller not found for user test on network SN_MAIN", locations: None, path: Some([Key("createSession")]), extensions: None }])',
      summary: "Controller not found for user",
      details: {
        operation: "createSession",
        network: "SN_MAIN",
        rpcError:
          "NotFound: controller not found for user test on network SN_MAIN",
        path: ["createSession"],
      },
    },
  },
  {
    input: {
      errors: [
        {
          message:
            "rpc error: code = InvalidArgument desc = invalid session token",
          path: ["authenticate"],
          extensions: { code: "INVALID_TOKEN" },
        },
      ],
    },
    expected: {
      raw: '{"errors":[{"message":"rpc error: code = InvalidArgument desc = invalid session token","path":["authenticate"],"extensions":{"code":"INVALID_TOKEN"}}]}',
      summary: "Invalid request parameters",
      details: {
        operation: "authenticate",
        rpcError: "InvalidArgument: invalid session token",
        path: ["authenticate"],
      },
    },
  },
  {
    input: {
      errors: [
        {
          message: "Network connection timeout",
          path: ["query"],
        },
      ],
    },
    expected: {
      raw: '{"errors":[{"message":"Network connection timeout","path":["query"]}]}',
      summary: "Request timeout",
      details: {
        operation: "query",
        path: ["query"],
      },
    },
  },
  {
    input: "Generic error message without GraphQL formatting",
    expected: {
      raw: "Generic error message without GraphQL formatting",
      summary: "GraphQL request failed",
      details: {},
    },
  },
  {
    input: {
      message: "Something went wrong with GraphQL",
    },
    expected: {
      raw: "Something went wrong with GraphQL",
      summary: "GraphQL request failed",
      details: {},
    },
  },
];
