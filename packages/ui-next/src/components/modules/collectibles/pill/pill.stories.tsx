import type { Meta, StoryObj } from "@storybook/react";
import { CollectiblePill } from "./pill";

const meta: Meta<typeof CollectiblePill> = {
  title: "Modules/Collectibles/Pill",
  component: CollectiblePill,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    label: "100",
  },
};

export default meta;
type Story = StoryObj<typeof CollectiblePill>;

export const Default: Story = {};

export const Faded: Story = {
  args: {
    variant: "faded",
  },
};
