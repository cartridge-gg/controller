import type { Meta, StoryObj } from "@storybook/react";
import { TransactionSending } from "./sending";
import { ERC20 } from "../provider/tokens";

const mockToken: ERC20 = {
  address: "0x0124aeb495b947201f5faC96fD1138E326AD86195B98df6DEc9009158A533B49",
  balance: 10000000000000000000n,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-expect-error
  contract: {
    address:
      "0x0124aeb495b947201f5faC96fD1138E326AD86195B98df6DEc9009158A533B49",
    decimals: undefined,
    logoUrl: undefined,
    name: undefined,
  },
  decimals: 18,
  icon: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo",
  name: "LORDS",
  price: {
    amount: "27172434262725432",
    base: "0x0124aeb495b947201f5faC96fD1138E326AD86195B98df6DEc9009158A533B49",
    decimals: 18,
    quote: "USDC",
  },
  symbol: "LORDS",
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
