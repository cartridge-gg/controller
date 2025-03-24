import type { Meta, StoryObj } from "@storybook/react";
import { StarterPackClaimable } from "./claimable";
import { ControllerIcon, GiftIcon } from "@/components/icons";

const meta = {
  title: "Modules/Starterpack/Claimable",
  component: StarterPackClaimable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    icon: {
      description: "Icon element to display",
      control: { type: "boolean" },
      mapping: {
        true: <GiftIcon variant="solid" />,
        false: undefined,
      },
    },
    items: {
      description: "Array of claimable items",
      control: { type: "object" },
    },
  },
} satisfies Meta<typeof StarterPackClaimable>;

export default meta;
type Story = StoryObj<typeof StarterPackClaimable>;

export const Default: Story = {
  args: {
    items: ["Adventurer #94", "Adventurer #95", "Adventurer #96"],
  },
};

export const WithIcon: Story = {
  args: {
    icon: <ControllerIcon />,
    items: ["Adventurer #94", "Adventurer #95", "Adventurer #96"],
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
