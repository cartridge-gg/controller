import type { Meta, StoryObj } from "@storybook/react";
import { CollectibleItemAction } from "./item-action";

const meta: Meta<typeof CollectibleItemAction> = {
  title: "Modules/Collectibles/Item Action",
  component: CollectibleItemAction,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    variant: "list",
  },
};

export default meta;
type Story = StoryObj<typeof CollectibleItemAction>;

export const List: Story = {};

export const Unlist: Story = {
  args: {
    variant: "unlist",
  },
};

export const Purchase: Story = {
  args: {
    variant: "purchase",
  },
};
