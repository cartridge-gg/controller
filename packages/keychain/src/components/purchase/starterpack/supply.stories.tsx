import type { Meta, StoryObj } from "@storybook/react";
import { Supply } from "./supply";

const meta: Meta<typeof Supply> = {
  component: Supply,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Supply>;

export const NotZero: Story = {
  args: {
    amount: 10,
  },
};

export const OutOfStock: Story = {
  args: {
    amount: 0,
  },
};
