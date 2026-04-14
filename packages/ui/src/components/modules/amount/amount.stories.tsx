import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Amount } from "./amount";

const meta: Meta<typeof Amount> = {
  title: "Modules/Amount",
  component: Amount,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    amount: undefined,
    balance: 1000,
    symbol: "LORDS",
    decimals: 18,
    conversion: undefined,
    onChange: fn(),
    onMax: fn(),
    setError: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Amount>;

export const Default: Story = {};

export const ZeroAmount: Story = {
  args: {
    balance: 0,
    amount: 0,
  },
};

export const NonZeroAmount: Story = {
  args: {
    amount: 50,
    conversion: "$16.54",
  },
};

export const NegativeAmount: Story = {
  args: {
    amount: -1,
  },
};

export const ZeroDecimals: Story = {
  args: {
    amount: -1,
    conversion: "$16.54",
    decimals: 0,
  },
};

export const IncrementButtons: Story = {
  args: {
    onPlus: fn(),
    onMinus: fn(),
    min: 0,
    max: 100,
  },
};
