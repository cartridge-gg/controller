import type { Meta, StoryObj } from "@storybook/react";

import { ConfirmTransaction } from "./ConfirmTransaction";
import { ETH_CONTRACT_ADDRESS } from "@cartridge/ui/utils";

const meta = {
  component: ConfirmTransaction,
  parameters: {
    connection: {
      controller: {
        estimateInvokeFee: () => ({
          suggestedMaxFee: "100",
        }),
        hasSession: () => true,
        session: () => true,
        isRequestedSession: () => Promise.resolve(true),
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

export const Default: Story = {
  args: {
    onComplete: (transaction_hash: string) => {
      console.log("Transaction completed:", transaction_hash);
    },
  },
};

export const WithTheme: Story = {
  parameters: {
    preset: "eternum",
  },
  args: {
    onComplete: (transaction_hash: string) => {
      console.log("Transaction completed:", transaction_hash);
    },
  },
};
