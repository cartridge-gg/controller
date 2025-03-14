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
    count: 9,
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
