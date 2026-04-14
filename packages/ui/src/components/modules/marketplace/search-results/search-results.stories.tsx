import type { Meta, StoryObj } from "@storybook/react";
import {
  OlmechIcon,
  MarketplaceSearchResult,
  MarketplaceSearchResults,
} from "@/index";

const meta: Meta<typeof MarketplaceSearchResults> = {
  title: "Modules/Marketplace/Search Results",
  component: MarketplaceSearchResults,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof MarketplaceSearchResults>;

export const Darkest: Story = {
  render: function Render() {
    return (
      <MarketplaceSearchResults variant="darkest" className="w-40">
        <MarketplaceSearchResult
          image={<OlmechIcon variant="one" className="h-full w-full" />}
          label="ashe"
          variant="darkest"
        />
        <MarketplaceSearchResult
          image={<OlmechIcon variant="two" className="h-full w-full" />}
          label="yourwurstknightmare"
          variant="darkest"
        />
      </MarketplaceSearchResults>
    );
  },
};

export const Darker: Story = {
  render: function Render() {
    return (
      <MarketplaceSearchResults variant="darker" className="w-40">
        <MarketplaceSearchResult
          image={<OlmechIcon variant="one" className="h-full w-full" />}
          label="ashe"
          variant="darker"
        />
        <MarketplaceSearchResult
          image={<OlmechIcon variant="two" className="h-full w-full" />}
          label="yourwurstknightmare"
          variant="darker"
        />
      </MarketplaceSearchResults>
    );
  },
};
