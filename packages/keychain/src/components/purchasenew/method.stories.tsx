import type { Meta, StoryObj } from "@storybook/react";
import { PaymentMethod } from "./method";

const meta = {
  component: PaymentMethod,
} satisfies Meta<typeof PaymentMethod>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
}; 