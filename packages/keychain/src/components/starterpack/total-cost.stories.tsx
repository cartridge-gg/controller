import type { Meta, StoryObj } from "@storybook/react";

import { TotalCost } from "./total-cost";

const meta: Meta<typeof TotalCost> = {
  component: TotalCost,
  parameters: {
    layout: "centered",
  },
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
    price: 100,
  },
  decorators: [
    (Story) => (
      <div className="w-full">
        <Story />
      </div>
    ),
  ],
};
