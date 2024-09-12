import type { Meta, StoryObj } from "@storybook/react";

import { ConfirmTransaction } from "./ConfirmTransaction";
import { ETH_CONTRACT_ADDRESS } from "../utils/token";

const meta = {
  component: ConfirmTransaction,
  parameters: {
    connection: {
      context: {
        origin: "http://localhost:3002",
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
