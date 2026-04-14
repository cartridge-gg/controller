import type { Meta, StoryObj } from "@storybook/react";
import { MarketplaceRadialItem } from "@/index";

const meta: Meta<typeof MarketplaceRadialItem> = {
  title: "Modules/Marketplace/Radial Item",
  component: MarketplaceRadialItem,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    active: false,
  },
};

export default meta;
type Story = StoryObj<typeof MarketplaceRadialItem>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <MarketplaceRadialItem label="Buy Now" active />
      <MarketplaceRadialItem label="Buy Now" />
    </div>
  ),
};
