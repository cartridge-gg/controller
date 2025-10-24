import type { Meta, StoryObj } from "@storybook/react";
import { OnchainCostBreakdown } from "./cost";

// USDC address with leading zeros (tests normalization)
const USDC_ADDRESS =
  "0x053C91253BC9682c04929cA02ED00b3E423f6710D2ee7e0D5EBB06F3eCF368A8";

const meta = {
  component: OnchainCostBreakdown,
  argTypes: {
    quote: {
      control: false, // Disable controls for BigInt serialization
    },
  },
} satisfies Meta<typeof OnchainCostBreakdown>;

export default meta;
type Story = StoryObj<typeof meta>;

// USDC payment example
export const USDCPayment: Story = {
  args: {
    quote: {
      basePrice: 100000000n, // $100 USDC (6 decimals)
      referralFee: 5000000n, // $5 USDC referral fee
      protocolFee: 2500000n, // $2.50 protocol fee (not shown in tooltip)
      totalCost: 107500000n, // $107.50 total
      paymentToken: USDC_ADDRESS,
    },
    platform: "starknet",
  },
};

// ETH payment example (18 decimals)
export const ETHPayment: Story = {
  args: {
    quote: {
      basePrice: 50000000000000000n, // 0.05 ETH
      referralFee: 2500000000000000n, // 0.0025 ETH
      protocolFee: 1250000000000000n, // 0.00125 ETH
      totalCost: 53750000000000000n, // 0.05375 ETH
      paymentToken:
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", // ETH on Starknet
    },
    platform: "starknet",
  },
};

// No referral fee (no tooltip)
export const NoReferral: Story = {
  args: {
    quote: {
      basePrice: 50000000n, // $50 USDC
      referralFee: 0n, // No referral
      protocolFee: 1250000n, // $1.25 protocol fee
      totalCost: 51250000n, // $51.25 total
      paymentToken: USDC_ADDRESS,
    },
    platform: "base",
  },
};

// With tooltip open
export const WithTooltipOpen: Story = {
  args: {
    quote: {
      basePrice: 25000000n, // $25 USDC
      referralFee: 1250000n, // $1.25 referral
      protocolFee: 625000n, // $0.625 protocol fee
      totalCost: 26875000n, // $26.875 total
      paymentToken: USDC_ADDRESS,
    },
    platform: "ethereum",
    openFeesTooltip: true,
  },
};
