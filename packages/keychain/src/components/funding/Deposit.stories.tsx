import type { Meta, StoryObj } from "@storybook/react";

import { Deposit } from "./Deposit";

const meta = {
  component: Deposit,
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
} satisfies Meta<typeof Deposit>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
