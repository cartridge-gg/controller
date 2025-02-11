import type { Meta, StoryObj } from "@storybook/react";

import { Deposit } from "./Deposit";

const meta = {
  component: Deposit,
  args: {
    onBack: () => {
      console.log("onBack");
    },
  },
} satisfies Meta<typeof Deposit>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
