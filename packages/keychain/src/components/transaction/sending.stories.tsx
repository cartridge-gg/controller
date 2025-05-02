import type { Meta, StoryObj } from "@storybook/react";
import { TransactionSending } from "./sending";
import type { Token } from "@cartridge/ui-next";

const mockToken: Token = {
  balance: {
    amount: 1275,
    value: 0,
    change: 0,
  },
  metadata: {
    name: "Paper",
    symbol: "PAPER",
    decimals: 18,
    address:
      "0x0410466536b5ae074f7fea81e5533b8134a9fa18b3dd077dd9db08f64997d113",
    image:
      "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/811f019a-0461-4cff-6c1e-442102863f00/logo",
  },
};

const meta: Meta<typeof TransactionSending> = {
  component: TransactionSending,
  title: "Transaction/Sending Card",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    token: mockToken,
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
