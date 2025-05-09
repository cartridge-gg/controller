import type { Meta, StoryObj } from "@storybook/react";
import { CollectibleAssetCard } from ".";

const meta: Meta<typeof CollectibleAssetCard> = {
  title: "Modules/Collectibles/Asset Card",
  component: CollectibleAssetCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    image:
      "https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png",
    title: "Adventurer #8",
    description: "Adventurers",
  },
};

export default meta;
type Story = StoryObj<typeof CollectibleAssetCard>;

export const Default: Story = {};
