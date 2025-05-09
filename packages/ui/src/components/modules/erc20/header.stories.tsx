import type { Meta, StoryObj } from "@storybook/react";
import { ERC20Header } from "./header";

const meta: Meta<typeof ERC20Header> = {
  title: "Modules/ERC20/Header",
  component: ERC20Header,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    token: {
      balance: {
        amount: 0.000071521921165994,
        value: 0.12851233577956853,
        change: -0.0003482251426370486,
      },
      metadata: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
        address:
          "0x049D36570D4e46f48e99674bd3fcc84644DdD6c96F7C741B1562B82f9e004dC7",
        image:
          "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ERC20Header>;

export const Default: Story = {};
