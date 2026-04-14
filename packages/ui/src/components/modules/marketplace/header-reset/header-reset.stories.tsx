import type { Meta, StoryObj } from "@storybook/react";
import { MarketplaceHeaderReset } from "@/index";

const meta: Meta<typeof MarketplaceHeaderReset> = {
  title: "Modules/Marketplace/Header Reset",
  component: MarketplaceHeaderReset,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {},
};

export default meta;
type Story = StoryObj<typeof MarketplaceHeaderReset>;

export const Default: Story = {};
