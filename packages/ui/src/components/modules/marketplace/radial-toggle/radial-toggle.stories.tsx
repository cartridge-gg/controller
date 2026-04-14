import type { Meta, StoryObj } from "@storybook/react";
import { MarketplaceRadialToggle } from "@/index";

const meta: Meta<typeof MarketplaceRadialToggle> = {
  title: "Modules/Marketplace/Radial Toggle",
  component: MarketplaceRadialToggle,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    active: false,
  },
};

export default meta;
type Story = StoryObj<typeof MarketplaceRadialToggle>;

export const Default: Story = {
  render: () => (
    <div className="flex gap-3">
      <MarketplaceRadialToggle active />
      <MarketplaceRadialToggle />
    </div>
  ),
};
