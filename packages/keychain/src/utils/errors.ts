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
  let executionError: string = (
    typeof error.data === "string" ? JSON.parse(error.data) : error.data
  )?.execution_error;
  if (!executionError) {
    return {
      raw: JSON.stringify(error.data),
      summary: error.message,
      stack: [],
    };
  }

  let summaryOveride;
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

  // Remove the "Contract constructor execution error:" prefix if it exists
  if (executionError.startsWith("Contract constructor execution error:")) {
    executionError = executionError.replace(
      /^Contract constructor execution error: /,
      "",
    );
    summaryOveride = "Contract constructor error";
  }

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
      } else if (errorLines[0].includes("Failure reason:")) {
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
      } else if (
        /.*Class with hash.*is not declared.$/.test(lastErrorMessage)
      ) {
        summary = "Class hash is not declared.";
      } else {
        summary = lastErrorMessage;
        lastError[lastError.length - 1] = summary;
      }
    }
  }

  return {
    raw: executionErrorRaw,
    summary: summaryOveride ? summaryOveride : summary,
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

export const starknetTransactionExecutionErrorTestCases = [
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
];
