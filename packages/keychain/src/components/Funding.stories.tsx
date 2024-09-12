import type { Meta, StoryObj } from "@storybook/react";

import { Funding } from "./Funding";
import { RpcProvider } from "starknet";

const meta = {
  component: Funding,
  parameters: {
    connection: {
      controller: {
        address:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        account: {
          rpc: new RpcProvider({ nodeUrl: "https://api.cartridge/x/sepolia" }),
        },
      },
    },
  },
} satisfies Meta<typeof Funding>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
