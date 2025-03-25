import type { Meta, StoryObj } from "@storybook/react";

import { ConfirmTransaction } from "./ConfirmTransaction";
import { ETH_CONTRACT_ADDRESS } from "@cartridge/utils";
import { constants } from "starknet";

const meta = {
  component: ConfirmTransaction,
  args: {
    defaultExpanded: true,
  },
  parameters: {
    connection: {
      controller: {
        estimateInvokeFee: () => ({
          suggestedMaxFee: "100",
        }),
        hasSession: () => true,
        session: () => true,
        chainId: () => constants.StarknetChainId.SN_SEPOLIA as string,
      },
      context: {
        origin: "http://localhost:6001",
        type: "execute",
        transactions: [
          {
            contractAddress: ETH_CONTRACT_ADDRESS,
            entrypoint: "approve",
            calldata: [
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              "0x0",
              "0x0",
            ],
          },
          {
            contractAddress: ETH_CONTRACT_ADDRESS,
            entrypoint: "transfer",
            calldata: [
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              "0x0",
              "0x0",
            ],
          },
        ],
        onCancel: () => {},
      },
    },
  },
} satisfies Meta<typeof ConfirmTransaction>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MultipleTransactions: Story = {
  parameters: {
    connection: {
      context: {
        transactions: [
          {
            contractAddress: ETH_CONTRACT_ADDRESS,
            entrypoint: "approve",
            calldata: [
              "0x0000000000000000000000000000000000000000000000000000000000000001",
              "0x123",
              "0x456",
            ],
          },
          {
            contractAddress: ETH_CONTRACT_ADDRESS,
            entrypoint: "transfer",
            calldata: [
              "0x0000000000000000000000000000000000000000000000000000000000000002",
              "0x789",
              "0xabc",
            ],
          },
          {
            contractAddress: ETH_CONTRACT_ADDRESS,
            entrypoint: "transferFrom",
            calldata: [
              "0x0000000000000000000000000000000000000000000000000000000000000003",
              "0xdef",
              "0x012",
            ],
          },
        ],
      },
    },
  },
};

export const HighFeeTransaction: Story = {
  parameters: {
    connection: {
      controller: {
        estimateInvokeFee: () => ({
          suggestedMaxFee: "1000000000000000",
        }),
      },
    },
  },
};

export const WithError: Story = {
  parameters: {
    connection: {
      context: {
        error: "Insufficient funds for transaction",
      },
    },
  },
};

export const LoadingState: Story = {
  parameters: {
    connection: {
      controller: {
        estimateInvokeFee: () => new Promise(() => {}), // Never resolves to simulate loading
      },
    },
  },
};

export const SingleTransaction: Story = {
  parameters: {
    connection: {
      context: {
        transactions: [
          {
            contractAddress: ETH_CONTRACT_ADDRESS,
            entrypoint: "transfer",
            calldata: [
              "0x0000000000000000000000000000000000000000000000000000000000000001",
              "0x10",
              "0x0",
            ],
          },
        ],
      },
    },
  },
};

export const WithObjectCalldata: Story = {
  parameters: {
    connection: {
      context: {
        transactions: [
          {
            contractAddress:
              "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            entrypoint: "swap_exact_tokens_for_tokens",
            calldata: {
              amountIn: "1000000000000000000",
              amountOutMin: "950000000000000000",
              path: [
                "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                "0x01a4c2b0de3539887fe46b8886c0a5cff850fc7930e33681e253ca8b356d5ff9",
              ],
              to: "0x01a4c2b0de3539887fe46b8886c0a5cff850fc7930e33681e253ca8b356d5ff9",
              deadline: "1714503698",
            },
          },
        ],
      },
    },
  },
};

export const WithComplexTypes: Story = {
  parameters: {
    connection: {
      context: {
        transactions: [
          {
            contractAddress:
              "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            entrypoint: "execute_batch",
            calldata: {
              transactions: [
                {
                  to: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                  selector: "transfer",
                  data: [
                    "0x01a4c2b0de3539887fe46b8886c0a5cff850fc7930e33681e253ca8b356d5ff9",
                    "1000000000000000000",
                    "0",
                  ],
                },
                {
                  to: "0x01a4c2b0de3539887fe46b8886c0a5cff850fc7930e33681e253ca8b356d5ff9",
                  selector: "approve",
                  data: [
                    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                    "2000000000000000000",
                  ],
                },
              ],
              nonce: "123456",
            },
          },
        ],
      },
    },
  },
};

export const WithUint256: Story = {
  parameters: {
    connection: {
      context: {
        transactions: [
          {
            contractAddress:
              "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            entrypoint: "deposit",
            calldata: {
              amount: { low: "1000000000000000000", high: "0" },
              recipient:
                "0x01a4c2b0de3539887fe46b8886c0a5cff850fc7930e33681e253ca8b356d5ff9",
            },
          },
        ],
      },
    },
  },
};

export const WithEnum: Story = {
  parameters: {
    connection: {
      context: {
        transactions: [
          {
            contractAddress:
              "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            entrypoint: "set_status",
            calldata: {
              status: { variant: "Active", value: true },
              user: "0x01a4c2b0de3539887fe46b8886c0a5cff850fc7930e33681e253ca8b356d5ff9",
            },
          },
        ],
      },
    },
  },
};

export const WithNestedObjects: Story = {
  parameters: {
    connection: {
      context: {
        transactions: [
          {
            contractAddress:
              "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            entrypoint: "create_order",
            calldata: {
              order: {
                id: "12345",
                details: {
                  price: { low: "1000000000000000000", high: "0" },
                  quantity: "5",
                  metadata: {
                    name: "Product XYZ",
                    description: "A high-quality product",
                    tags: ["premium", "limited", "exclusive"],
                  },
                },
                buyer:
                  "0x01a4c2b0de3539887fe46b8886c0a5cff850fc7930e33681e253ca8b356d5ff9",
                seller:
                  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                status: { variant: "Pending", value: null },
              },
              timestamp: "1714503698",
            },
          },
        ],
      },
    },
  },
};

export const WithLongArrays: Story = {
  parameters: {
    connection: {
      context: {
        transactions: [
          {
            contractAddress:
              "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            entrypoint: "batch_transfer",
            calldata: [
              "10", // Number of recipients
              "0x01a4c2b0de3539887fe46b8886c0a5cff850fc7930e33681e253ca8b356d5ff9",
              "0x02a4c2b0de3539887fe46b8886c0a5cff850fc7930e33681e253ca8b356d5ff9",
              "0x03a4c2b0de3539887fe46b8886c0a5cff850fc7930e33681e253ca8b356d5ff9",
              "0x04a4c2b0de3539887fe46b8886c0a5cff850fc7930e33681e253ca8b356d5ff9",
              "0x05a4c2b0de3539887fe46b8886c0a5cff850fc7930e33681e253ca8b356d5ff9",
              "0x06a4c2b0de3539887fe46b8886c0a5cff850fc7930e33681e253ca8b356d5ff9",
              "0x07a4c2b0de3539887fe46b8886c0a5cff850fc7930e33681e253ca8b356d5ff9",
              "0x08a4c2b0de3539887fe46b8886c0a5cff850fc7930e33681e253ca8b356d5ff9",
              "0x09a4c2b0de3539887fe46b8886c0a5cff850fc7930e33681e253ca8b356d5ff9",
              "0x10a4c2b0de3539887fe46b8886c0a5cff850fc7930e33681e253ca8b356d5ff9",
              "1000000000000000000", // Amount for each recipient
            ],
          },
        ],
      },
    },
  },
};

export const WithMultipleComplexTransactions: Story = {
  parameters: {
    connection: {
      context: {
        transactions: [
          {
            contractAddress:
              "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            entrypoint: "deposit",
            calldata: {
              amount: { low: "1000000000000000000", high: "0" },
              recipient:
                "0x01a4c2b0de3539887fe46b8886c0a5cff850fc7930e33681e253ca8b356d5ff9",
            },
          },
          {
            contractAddress:
              "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            entrypoint: "swap_exact_tokens_for_tokens",
            calldata: {
              amountIn: "1000000000000000000",
              amountOutMin: "950000000000000000",
              path: [
                "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                "0x01a4c2b0de3539887fe46b8886c0a5cff850fc7930e33681e253ca8b356d5ff9",
              ],
              to: "0x01a4c2b0de3539887fe46b8886c0a5cff850fc7930e33681e253ca8b356d5ff9",
              deadline: "1714503698",
            },
          },
          {
            contractAddress:
              "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            entrypoint: "set_status",
            calldata: {
              status: { variant: "Active", value: true },
              user: "0x01a4c2b0de3539887fe46b8886c0a5cff850fc7930e33681e253ca8b356d5ff9",
            },
          },
        ],
      },
    },
  },
};

export const WithTheme: Story = {
  parameters: {
    preset: "eternum",
  },
  args: {
    defaultExpanded: true,
  },
};
