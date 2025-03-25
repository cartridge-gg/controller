import type { Meta, StoryObj } from "@storybook/react";
import { CollectiblePreview } from ".";

const meta: Meta<typeof CollectiblePreview> = {
  title: "Modules/Collectibles/Preview",
  component: CollectiblePreview,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    image:
      "https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png",
  },
};

export default meta;
type Story = StoryObj<typeof CollectiblePreview>;

export const Default: Story = {};

export const Hover: Story = {
  args: {
    hover: true,
  },
};

export const Small: Story = {
  args: {
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
  },
};

export const Fallback: Story = {
  args: {
    image: "",
  },
};

export const FallbackSmall: Story = {
  args: {
    size: "sm",
    image: "",
  },
};

export const FallbackLarge: Story = {
  args: {
    size: "lg",
    image: "",
  },
};
