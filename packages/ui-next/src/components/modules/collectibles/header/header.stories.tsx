import type { Meta, StoryObj } from "@storybook/react";
import { CollectibleHeader } from "./header";
import { fn } from "@storybook/test";

const meta: Meta<typeof CollectibleHeader> = {
  title: "Modules/Collectibles/Header",
  component: CollectibleHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    title: "Beasts",
    label: "9",
    onSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof CollectibleHeader>;

export const Default: Story = {};

export const LongName: Story = {
  args: {
    title:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
  },
};

export const Hover: Story = {
  args: {
    hover: true,
  },
};

export const Selectable: Story = {
  args: {
    selectable: true,
  },
};

export const Selected: Story = {
  args: {
    selected: true,
  },
};

export const Icon: Story = {
  args: {
    icon: "https://placehold.co/100x100",
  },
};
