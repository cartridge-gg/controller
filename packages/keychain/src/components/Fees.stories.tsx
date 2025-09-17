import type { Meta, StoryObj } from "@storybook/react";
import { Fees } from "./Fees";
import { FeeEstimate } from "starknet";

// Mock fee estimates
const mockFeeEstimate: FeeEstimate = {
  overall_fee: "1000000000000000000", // 1 STRK in wei
  l1_gas_consumed: "1000",
  l1_gas_price: "1000000000",
  l2_gas_consumed: "2000",
  l2_gas_price: "500000000",
  l1_data_gas_consumed: "100",
  l1_data_gas_price: "1000000000",
  unit: "FRI",
};

const mockFreeFeeEstimate: FeeEstimate = {
  overall_fee: "0x0",
  l1_gas_consumed: "0",
  l1_gas_price: "0",
  l2_gas_consumed: "0",
  l2_gas_price: "0",
  l1_data_gas_consumed: "0",
  l1_data_gas_price: "0",
  unit: "FRI",
};

const mockHighFeeEstimate: FeeEstimate = {
  overall_fee: "5000000000000000000", // 5 STRK in wei
  l1_gas_consumed: "5000",
  l1_gas_price: "2000000000",
  l2_gas_consumed: "10000",
  l2_gas_price: "1000000000",
  l1_data_gas_consumed: "500",
  l1_data_gas_price: "2000000000",
  unit: "FRI",
};

const mockSmallFeeEstimate: FeeEstimate = {
  overall_fee: "1000000000000000", // 0.001 STRK in wei
  l1_gas_consumed: "100",
  l1_gas_price: "1000000000",
  l2_gas_consumed: "200",
  l2_gas_price: "500000000",
  l1_data_gas_consumed: "10",
  l1_data_gas_price: "1000000000",
  unit: "FRI",
};

const meta: Meta<typeof Fees> = {
  title: "Components/Fees",
  component: Fees,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A component that displays network fees for transactions. Shows loading states, free transactions, and USD-converted fee amounts.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-96 p-4 bg-background">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    isLoading: {
      description: "Whether the fee estimation is currently loading",
      control: "boolean",
    },
    maxFee: {
      description: "The estimated fee from StarkNet",
      control: "object",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story - normal fee
export const Default: Story = {
  args: {
    isLoading: false,
    maxFee: mockFeeEstimate,
  },
};

// Loading state
export const Loading: Story = {
  args: {
    isLoading: true,
    maxFee: undefined,
  },
};

// Free transaction
export const FreeTransaction: Story = {
  args: {
    isLoading: false,
    maxFee: mockFreeFeeEstimate,
  },
};

// High fee transaction
export const HighFee: Story = {
  args: {
    isLoading: false,
    maxFee: mockHighFeeEstimate,
  },
};

// Small fee transaction
export const SmallFee: Story = {
  args: {
    isLoading: false,
    maxFee: mockSmallFeeEstimate,
  },
};

// No fee estimate provided
export const NoFeeEstimate: Story = {
  args: {
    isLoading: false,
    maxFee: undefined,
  },
};

// Interactive story with controls
export const Interactive: Story = {
  args: {
    isLoading: false,
    maxFee: mockFeeEstimate,
  },
  argTypes: {
    isLoading: {
      control: "boolean",
    },
    maxFee: {
      control: "object",
    },
  },
};
