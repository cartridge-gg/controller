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
    image:
      "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo",
  },
};

export default meta;
type Story = StoryObj<typeof TokenCard>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    value: "$31.40",
  },
};

export const Increasing: Story = {
  args: {
    value: "$31.40",
    change: "+$1.78",
  },
};

export const Decreasing: Story = {
  args: {
    value: "$31.40",
    change: "-$1.78",
  },
};

export const IncreasingAmount: Story = {
  args: {
    value: "$31.40",
    increasing: true,
    clickable: false,
  },
};

export const DecreasingAmount: Story = {
  args: {
    value: "$31.40",
    decreasing: true,
    clickable: false,
  },
};

export const Free: Story = {
  args: {
    isFree: true,
    clickable: false,
  },
};

export const SquareImage: Story = {
  args: {
    title: "Adventurer",
    image:
      "https://api.cartridge.gg/x/arcade-main/torii/static/0x036017e69d21d6d8c13e266eabb73ef1f1d02722d86bdcabe5f168f8e549d3cd/0x0000000000000000000000000000000000000000000000000000000000000001/image",
    // value: "$31.40",
    roundedImage: false,
  },
};
