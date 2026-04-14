import type { Meta, StoryObj } from "@storybook/react";
import { StarterpackClaimable } from "./claimable";

const meta = {
  title: "Modules/Starterpack/Claimable",
  component: StarterpackClaimable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    items: {
      description: "Array of claimable items",
      control: { type: "object" },
    },
  },
} satisfies Meta<typeof StarterpackClaimable>;

export default meta;
type Story = StoryObj<typeof StarterpackClaimable>;

export const Default: Story = {
  args: {
    items: ["Adventurer #94", "Adventurer #95", "Adventurer #96"],
  },
};

export const Claimed: Story = {
  args: {
    items: ["Adventurer #94", "Adventurer #95", "Adventurer #96"],
    isClaimed: true,
  },
};

export const SingleItem: Story = {
  args: {
    items: ["Special Bonus Item"],
  },
};

export const ManyItems: Story = {
  args: {
    items: [
      "Adventurer #94",
      "Adventurer #95",
      "Adventurer #96",
      "Adventurer #97",
      "Adventurer #98",
      "Adventurer #99",
      "Adventurer #100",
    ],
  },
};

export const LongItemNames: Story = {
  args: {
    items: [
      "This is a very long item name that might need special handling for display purposes",
      "Another long item name that could potentially wrap to multiple lines",
      "Short item",
    ],
  },
};
