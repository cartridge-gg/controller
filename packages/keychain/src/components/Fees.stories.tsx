import type { Meta, StoryObj } from "@storybook/react";
import { Fees } from "./Fees";
import { EstimateFee } from "starknet";

const mockMaxFee: EstimateFee = {
  data_gas_consumed: 192n,
  data_gas_price: 2355528116408n,
  gas_consumed: 21n,
  gas_price: 20818278988114n,
  overall_fee: 69589765917876930n,
  resourceBounds: {
    l1_gas: {
      max_amount: "0x0",
      max_price_per_unit: "0x0",
    },
    l2_gas: {
      max_amount: "0x0",
      max_price_per_unit: "0x0",
    },
  },
  suggestedMaxFee: 69589765917876930n,
  unit: "FRI",
};

const meta: Meta<typeof Fees> = {
  title: "Components/Fees",
  component: Fees,
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ padding: "1rem" }}>
      <Fees isLoading={false} className="w-[300px]" />
    </div>
  ),
};

export const WithDiscount: Story = {
  render: () => (
    <div style={{ padding: "1rem" }}>
      <Fees isLoading={false} className="w-[300px]" discount="100%" />
    </div>
  ),
};

export const WithEstimateFee: Story = {
  render: () => (
    <div style={{ padding: "1rem" }}>
      <Fees
        isLoading={false}
        className="w-[300px]"
        discount="100%"
        maxFee={mockMaxFee}
      />
    </div>
  ),
};

export const IsLoading: Story = {
  render: () => (
    <div style={{ padding: "1rem" }}>
      <Fees isLoading={true} className="w-[300px]" />
    </div>
  ),
};
