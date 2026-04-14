import type { Meta, StoryObj } from "@storybook/react";
import { OlmechIcon, MarketplaceSearchCard } from "@/index";

const meta: Meta<typeof MarketplaceSearchCard> = {
  title: "Modules/Marketplace/Search Card",
  component: MarketplaceSearchCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    image: <OlmechIcon variant="one" className="h-full w-full" />,
    label: "ashe",
  },
};

export default meta;
type Story = StoryObj<typeof MarketplaceSearchCard>;

export const Default: Story = {};

export const Long: Story = {
  args: {
    label: "yourwurstknightmare",
    className: "max-w-40",
  },
};
