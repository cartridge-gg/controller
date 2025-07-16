import { Meta, StoryObj } from "@storybook/react";
import { Inventory } from ".";
import { useAccount } from "@/hooks/account.mock";
import { accounts } from "@cartridge/ui/utils/mock/data";

const meta = {
  component: Inventory,
  parameters: {
    router: {
      params: {
        project: "test-project-0",
      },
    },
  },
} satisfies Meta<typeof Inventory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TestAccount1: Story = {
  beforeEach() {
    useAccount.mockReturnValue({
      username: accounts["test-1"].username,
      address: accounts["test-1"].address,
    });
  },
};
