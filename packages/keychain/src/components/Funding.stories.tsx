import type { Meta, StoryObj } from "@storybook/react";

import { Funding } from "./Funding";

const meta = {
  component: Funding,
  parameters: {
    connection: {
      controller: {
        address:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        account: {
          rpc: "http://localhost:3002",
        },
      },
    },
  },
} satisfies Meta<typeof Funding>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultAmount: "10000000000000000",
  },
};
