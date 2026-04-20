import type { Meta, StoryObj } from "@storybook/react";
import { CollectibleCardFooter } from "@/index";

const meta: Meta<typeof CollectibleCardFooter> = {
  title: "Modules/Collectibles/Card Footer",
  component: CollectibleCardFooter,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    price: "$2",
    lastSale: "$2",
  },
};

export default meta;
type Story = StoryObj<typeof CollectibleCardFooter>;

export const Default: Story = {};

export const PriceLess: Story = {
  args: {
    price: undefined,
    lastSale: "$2",
  },
};

export const SaleLess: Story = {
  args: {
    price: "$2",
    lastSale: undefined,
  },
};

export const PriceAndSale: Story = {
  args: {
    price: {
      value: "100",
      image:
        "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo",
    },
    lastSale: {
      value: "90",
      image:
        "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo",
    },
  },
};
