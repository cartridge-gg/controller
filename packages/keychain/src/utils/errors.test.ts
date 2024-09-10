import { describe, it, expect } from "@jest/globals";
import { parseExecutionError } from "./errors";

describe("parseExecutionError", () => {
  const testCases = [
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
        raw: "0: Error in the called contract (contract address: 0x02027fbc303fb8e3b2ac09a9d6e3cfe4b3085fe3d9b07900e282cbc9868a8226, class hash: 0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nError at pc=0:14785:\nCairo traceback (most recent call last):\nUnknown location (pc=0:351)\nUnknown location (pc=0:5795)\n\n1: Error in the called contract (contract address: 0x036486801b8f42e950824cba55b2df8cccb0af2497992f807a7e1d9abd2c6ba1, class hash: 0x0000000000000000000000000000000000000000000000000000000000000000, selector: 0x00e166029724b7a6bdc8fec815d48f7b1fe1dada0f096affffb3143be9bcdcef):\nRequested contract address 0x036486801b8f42e950824cba55b2df8cccb0af2497992f807a7e1d9abd2c6ba1 is not deployed.\n",
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
        raw: "0: Error in the called contract (contract address: 0x02027fbc303fb8e3b2ac09a9d6e3cfe4b3085fe3d9b07900e282cbc9868a8226, class hash: 0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nError at pc=0:14785:\nCairo traceback (most recent call last):\nUnknown location (pc=0:351)\nUnknown location (pc=0:5795)\n\n1: Error in the called contract (contract address: 0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7, class hash: 0x02a8846878b6ad1f54f6ba46f5f40e11cee755c677f130b2c4b60566c9003f1f, selector: 0x0219209e083275171774dab1df80982e9df2096516f06319c5c6d71ae0a8480c):\nError at pc=0:1354:\nAn ASSERT_EQ instruction failed: 5:3 != 5:0.\n",
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
        raw: "0: Error in the called contract (contract address: 0x02027fbc303fb8e3b2ac09a9d6e3cfe4b3085fe3d9b07900e282cbc9868a8226, class hash: 0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nError at pc=0:14785:\nCairo traceback (most recent call last):\nUnknown location (pc=0:351)\nUnknown location (pc=0:5795)\n\n1: Error in the called contract (contract address: 0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7, class hash: 0x02a8846878b6ad1f54f6ba46f5f40e11cee755c677f130b2c4b60566c9003f1f, selector: 0x0219209e083275171774dab1df80982e9df2096516f06319c5c6d71ae0a8480c):\nError at pc=0:192:\nCairo traceback (most recent call last):\nUnknown location (pc=0:1361)\nUnknown location (pc=0:1340)\nError message: ERC20: amount is not a valid Uint256\nUnknown location (pc=0:750)\n\nRange-check validation failed, number 4291026117947750527606861672462094693314608 is out of valid range [0, 340282366920938463463374607431768211456]\n",
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
        raw: "0: Error in the called contract (contract address: 0x00eeca9141c6f3f3d4664da9521397e3c1df155ea41af91bd7a9e96ffee5681a, class hash: 0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nError at pc=0:14785:\nCairo traceback (most recent call last):\nUnknown location (pc=0:351)\nUnknown location (pc=0:5795)\n\n1: Error in the called contract (contract address: 0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7, class hash: 0x02a8846878b6ad1f54f6ba46f5f40e11cee755c677f130b2c4b60566c9003f1f, selector: 0x0183420eb7aafd9caad318b543d9252c94857340f4768ac83cf4b6472f0bf515):\nEntry point EntryPointSelector(0x183420eb7aafd9caad318b543d9252c94857340f4768ac83cf4b6472f0bf515) not found in contract.\n",
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
  ];

  testCases.forEach(({ input, expected }, i) => {
    it(`should correctly parse error at ${i}`, () => {
      const result = parseExecutionError(input, 0);
      expect(result).toEqual(expected);
    });
  });
});

// The operation either timed out or was not allowed. See: https://www.w3.org/TR/webauthn-2/#sctn-privacy-considerations-client.
