import type { Meta, StoryObj } from "@storybook/react";
import { CollectibleAsset } from "./asset";
import { fn } from "@storybook/test";

const meta: Meta<typeof CollectibleAsset> = {
  title: "Modules/Collectibles/Asset",
  component: CollectibleAsset,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    image:
      "https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png",
    title: "Beasts",
    quantity: 9,
    sales: 100,
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof CollectibleAsset>;

export const Default: Story = {};

export const Faded: Story = {
  args: {
    variant: "faded",
  },
};

export const Icon: Story = {
  args: {
    icon: "https://placehold.co/100x100",
  },
};
