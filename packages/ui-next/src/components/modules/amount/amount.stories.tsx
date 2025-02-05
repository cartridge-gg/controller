import type { Meta, StoryObj } from "@storybook/react";
import { Amount } from "./amount";

const meta: Meta<typeof Amount> = {
  title: "Modules/Amount",
  component: Amount,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    amount: 1000,
    balance: 1000,
    symbol: "USDC",
    decimals: 5,
    conversion: "1000",
    onChange: () => {},
    onMax: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof Amount>;

export const Default: Story = {};

export const NegativeAmount: Story = {
  args: {
    amount: -1234.56,
  },
};

export const LargeNumber: Story = {
  args: {
    balance: 1234567.89,
    amount: 1234567.89,
  },
};

export const ZeroAmount: Story = {
  args: {
    balance: 0,
    amount: 0,
  },
};
