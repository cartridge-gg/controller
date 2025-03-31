import type { Meta, StoryObj } from "@storybook/react";
import { TokenCard } from "./";

const meta: Meta<typeof TokenCard> = {
  title: "Modules/Tokens/Card",
  component: TokenCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    title: "Ether",
    amount: "0.01 ETH",
    value: "$31.40",
    image:
      "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo",
  },
};

export default meta;
type Story = StoryObj<typeof TokenCard>;

export const Default: Story = {};

export const Increasing: Story = {
  args: {
    change: "+$1.78",
  },
};

export const Decreasing: Story = {
  args: {
    change: "-$1.78",
  },
};
