import type { Meta, StoryObj } from "@storybook/react";

import { DepositEth } from "./DepositEth";

const meta = {
  component: DepositEth,
  parameters: {
    connection: {
      controller: {
        address:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        username: () => "user",
      },
    },
  },
  args: {
    onBack: () => {
      console.log("onBack");
    },
  },
} satisfies Meta<typeof DepositEth>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
