import type { Meta, StoryObj } from "@storybook/react";
import { MarketplaceAssetFilter } from "@/index";

const meta: Meta<typeof MarketplaceAssetFilter> = {
  title: "Modules/Marketplace/Asset Filter",
  component: MarketplaceAssetFilter,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {},
};

export default meta;
type Story = StoryObj<typeof MarketplaceAssetFilter>;

export const Default: Story = {};
