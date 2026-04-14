import type { Meta, StoryObj } from "@storybook/react";
import { CollectibleItemDetails } from "./item-details";

const meta: Meta<typeof CollectibleItemDetails> = {
  title: "Modules/Collectibles/Item Details",
  component: CollectibleItemDetails,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    owner: "shinobi",
    quantity: 1,
  },
};

export default meta;
type Story = StoryObj<typeof CollectibleItemDetails>;

export const Default: Story = {};

export const Listed: Story = {
  args: {
    owner: "shinobi",
    quantity: 1,
    price: "24",
    logo: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo",
    expiration: "1mo",
  },
};
