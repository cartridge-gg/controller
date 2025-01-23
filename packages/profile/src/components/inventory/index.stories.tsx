import { Meta, StoryObj } from "@storybook/react";
import { Inventory } from ".";
import { accounts } from "@cartridge/utils/mock/data";
import { decorator } from "@/hooks/account.mock";

const meta = {
  component: Inventory,
} satisfies Meta<typeof Inventory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TestAccount1: Story = {
  parameters: {
    account: accounts["test-1"],
  },
  decorators: [decorator],
};
