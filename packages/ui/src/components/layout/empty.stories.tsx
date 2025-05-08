import type { Meta, StoryObj } from "@storybook/react";
import { Empty } from "./index";

const meta: Meta<typeof Empty> = {
  title: "Layout/Empty",
  component: Empty,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof Empty>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Discover: Story = {
  args: {
    title: "It's empty here",
    icon: "discover",
  },
};

export const Activity: Story = {
  args: {
    title: "It's empty here",
    icon: "activity",
  },
};

export const Achievements: Story = {
  args: {
    title: "No achievements available",
    icon: "achievement",
  },
};

export const Guild: Story = {
  args: {
    title: "Coming soon",
    icon: "guild",
  },
};

export const Inventory: Story = {
  args: {
    title: "No items available",
    icon: "inventory",
  },
};
