import type { Meta, StoryObj } from "@storybook/react";
import { StarterpackCard } from "./card";

const meta = {
  title: "Modules/Starterpack/Card",
  component: StarterpackCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    item: {
      description: "claimable item",
      control: { type: "object" },
    },
  },
} satisfies Meta<typeof StarterpackCard>;

export default meta;
type Story = StoryObj<typeof StarterpackCard>;

export const Default: Story = {
  args: {
    item: "Adventurer #94",
  },
};

export const Claimed: Story = {
  args: {
    item: "Adventurer #94",
    isClaimed: true,
  },
};

export const LongItemNames: Story = {
  args: {
    item: "This is a very long item name that might need special handling for display purposes",
  },
};
