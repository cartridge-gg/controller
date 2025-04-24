import type { Meta, StoryObj } from "@storybook/react";
import { CostBreakdown } from "./CostBreakdown";

const meta = {
  component: CostBreakdown,
} satisfies Meta<typeof CostBreakdown>;

export default meta;

type Story = StoryObj<typeof meta>;

/* eslint-disable */
const PaddedBreakdown = (Story: any) => {
  return (
    <div className="p-4">
      <Story />
    </div>
  );
};

export const Stripe: Story = {
  args: {
    rails: "stripe",
    price: {
      baseCostInCents: 1000,
      processingFeeInCents: 100,
      totalInCents: 1100,
    },
  },
  decorators: [PaddedBreakdown],
};

export const Crypto: Story = {
  args: {
    rails: "crypto",
    price: {
      baseCostInCents: 1000,
      processingFeeInCents: 100,
      totalInCents: 1100,
    },
    paymentUnit: "usdc",
    walletType: "phantom",
  },
  decorators: [PaddedBreakdown],
};

export const StripeWithTooltip: Story = {
  args: {
    rails: "stripe",
    price: {
      baseCostInCents: 1000,
      processingFeeInCents: 100,
      totalInCents: 1100,
    },
    openFeesTooltip: true,
  },
  decorators: [PaddedBreakdown],
};

export const CryptoWithTooltip: Story = {
  args: {
    rails: "crypto",
    price: {
      baseCostInCents: 1000,
      processingFeeInCents: 100,
      totalInCents: 1100,
    },
    paymentUnit: "usdc",
    walletType: "phantom",
    openFeesTooltip: true,
  },
  decorators: [PaddedBreakdown],
};
