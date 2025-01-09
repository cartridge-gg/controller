import type { Meta, StoryObj } from "@storybook/react";

import { AmountSelection } from "./AmountSelection";

const meta = {
  component: AmountSelection,
  args: {
    amount: 1,
    enableCustom: true,
  },
} satisfies Meta<typeof AmountSelection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
