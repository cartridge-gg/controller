import type { Meta, StoryObj } from "@storybook/react";
import { CallCard } from "./CallCard";
import { constants } from "starknet";
import Controller from "@/utils/controller";

const meta: Meta<typeof CallCard> = {
  component: CallCard,
  title: "Transaction/CallCard",
  parameters: {
    layout: "centered",
    connection: {
      controller: {
        chainId: () => constants.StarknetChainId.SN_SEPOLIA as string,
      } as Partial<Controller>,
    },
  },
  argTypes: {
    address: { control: "text" },
    title: { control: "text" },
    call: { control: "object" },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "300px" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const SimpleCalldata: Story = {
  args: {
    address:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    title: "Transfer",
    call: {
      contractAddress:
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      entrypoint: "transfer",
      calldata: [
        "0x01a4c2b0de3539887fe46b8886c0a5cff850fc7930e33681e253ca8b356d5ff9",
        "1000000000000000000",
        "0",
      ],
    },
    defaultExpanded: true,
  },
};

export const ObjectCalldata: Story = {
  args: {
    address:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    title: "Swap",
    call: {
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
    defaultExpanded: true,
  },
};

export const ComplexTypes: Story = {
  args: {
    address:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    title: "Complex Transaction",
    call: {
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
    defaultExpanded: true,
  },
};

export const WithUint256: Story = {
  args: {
    address:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    title: "With Uint256",
    call: {
      contractAddress:
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      entrypoint: "deposit",
      calldata: {
        amount: { low: "1000000000000000000", high: "0" },
        recipient:
          "0x01a4c2b0de3539887fe46b8886c0a5cff850fc7930e33681e253ca8b356d5ff9",
      },
    },
    defaultExpanded: true,
  },
};

export const WithEnum: Story = {
  args: {
    address:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    title: "With Enum",
    call: {
      contractAddress:
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      entrypoint: "set_status",
      calldata: {
        status: { variant: "Active", value: true },
        user: "0x01a4c2b0de3539887fe46b8886c0a5cff850fc7930e33681e253ca8b356d5ff9",
      },
    },
    defaultExpanded: true,
  },
};

export const NestedObjects: Story = {
  args: {
    address:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    title: "Nested Objects",
    call: {
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
    defaultExpanded: true,
  },
};

export const LongArrays: Story = {
  args: {
    address:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    title: "Long Arrays",
    call: {
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
    defaultExpanded: true,
  },
};
