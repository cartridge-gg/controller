import type { Meta, StoryObj } from "@storybook/react";
import { TransactionDestination } from "./destination";

const meta: Meta<typeof TransactionDestination> = {
  component: TransactionDestination,
  title: "Transaction/Destination Card",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    name: "clicksave",
    address: "0x1234567890abcdef1234567890abcdef12345678",
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

export const Default: Story = {};
