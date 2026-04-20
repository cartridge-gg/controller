import type { Meta, StoryObj } from "@storybook/react";
import { CollectibleFooter } from ".";

const meta: Meta<typeof CollectibleFooter> = {
  title: "Modules/Collectibles/Footer",
  component: CollectibleFooter,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    title: "Title",
  },
};

export default meta;
type Story = StoryObj<typeof CollectibleFooter>;

export const Default: Story = {};

export const InventoryCollection: Story = {
  args: {
    title: "Loot Survivor",
    icon: "https://static.cartridge.gg/presets/loot-survivor/icon.png",
    totalCount: 3,
  },
};

export const InventoryItem: Story = {
  args: {
    title: '"Grim Sun" Hippogriff',
  },
};

export const InventoryItemListed: Story = {
  args: {
    title: '"Grim Sun" Hippogriff',
    listingCount: 3,
  },
};

export const InventoryItem1155: Story = {
  args: {
    title: '"Grim Sun" Hippogriff',
    totalCount: 3,
  },
};

export const Packed: Story = {
  args: {
    title:
      '"Grim Sun" Hippogriff The Super Beast That Has No Chill And No One Can Defeat Unless They Have A Really Good Weapon And A Really Good Armor',
    listingCount: 3,
    totalCount: 3,
  },
};
