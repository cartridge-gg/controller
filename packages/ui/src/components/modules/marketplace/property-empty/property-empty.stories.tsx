import type { Meta, StoryObj } from "@storybook/react";
import { MarketplacePropertyEmpty } from "@/index";

const meta: Meta<typeof MarketplacePropertyEmpty> = {
  title: "Modules/Marketplace/Property Empty",
  component: MarketplacePropertyEmpty,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {},
};

export default meta;
type Story = StoryObj<typeof MarketplacePropertyEmpty>;

export const Default: Story = {};
