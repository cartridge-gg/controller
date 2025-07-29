import type { Meta, StoryObj } from "@storybook/react";
import { PurchaseCredits } from "./credits";

const meta = {
  component: PurchaseCredits,
} satisfies Meta<typeof PurchaseCredits>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
