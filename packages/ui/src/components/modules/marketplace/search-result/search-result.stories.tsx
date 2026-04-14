import type { Meta, StoryObj } from "@storybook/react";
import { OlmechIcon, MarketplaceSearchResult } from "@/index";

const meta: Meta<typeof MarketplaceSearchResult> = {
  title: "Modules/Marketplace/Search Result",
  component: MarketplaceSearchResult,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    image: <OlmechIcon variant="one" className="h-full w-full" />,
    label: "ashe",
  },
};

export default meta;
type Story = StoryObj<typeof MarketplaceSearchResult>;

export const Darkest: Story = {
  args: {
    variant: "darkest",
  },
};

export const Darker: Story = {
  args: {
    variant: "darker",
  },
};
