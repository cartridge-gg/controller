import { describe, it, expect } from "@jest/globals";
import { parseExecutionError, parseValidationError } from "./errors";

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
  ];

  testCases.forEach(({ input, expected }, i) => {
    it(`should correctly parse error at ${i}`, () => {
      const result = parseExecutionError(input, 0);
      expect(result).toEqual(expected);
    });
  });
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
});
