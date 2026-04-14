import type { Meta, StoryObj } from "@storybook/react";
import { MarketplaceHeaderLabel } from "@/index";

const meta: Meta<typeof MarketplaceHeaderLabel> = {
  title: "Modules/Marketplace/Header Label",
  component: MarketplaceHeaderLabel,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    label: "Properties",
  },
};

export default meta;
type Story = StoryObj<typeof MarketplaceHeaderLabel>;

export const Default: Story = {};
