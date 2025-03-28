import type { Meta, StoryObj } from "@storybook/react";
import { Spending } from "./spending";

const meta: Meta<typeof Spending> = {
  component: Spending,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    price: 50,
  },
};

export const WithCustomTitle: Story = {
  args: {
    title: "Total Spending",
    price: 250.75,
  },
};

export const LargeAmount: Story = {
  args: {
    price: 9999.99,
  },
};
