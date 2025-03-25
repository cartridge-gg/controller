import type { Meta, StoryObj } from "@storybook/react";
import { StarterItemData, StarterpackContains } from "./contains";

const meta = {
  title: "Modules/Starterpack/Contains",
  component: StarterpackContains,
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
} satisfies Meta<typeof StarterpackContains>;

export default meta;
type Story = StoryObj<typeof StarterpackContains>;

const starterPackItems: StarterItemData[] = [
  {
    title: "Village",
    description:
      "Villages are the basic building block of eternum, they allow you to produce troops and resources.",
    image: "https://r2.quddus.my/Frame%203231.png",
  },
  {
    title: "20 Credits",
    description: "Credits cover service fee(s) in Eternum.",
    image: "/ERC-20-Icon.svg",
  },
];

export const Default: Story = {
  args: {
    items: starterPackItems,
  },
};

export const SingleItem: Story = {
  args: {
    items: starterPackItems.slice(0, 1),
  },
};
