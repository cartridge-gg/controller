import type { Meta, StoryObj } from "@storybook/react";
import {
  OlmechIcon,
  MarketplaceSearchCard,
  MarketplaceSearchEngine,
} from "@/index";
import { useState } from "react";

const meta: Meta<typeof MarketplaceSearchEngine> = {
  title: "Modules/Marketplace/Search Engine",
  component: MarketplaceSearchEngine,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    search: "Loot",
  },
};

export default meta;
type Story = StoryObj<typeof MarketplaceSearchEngine>;

export const Darkest: Story = {
  render: function Render(args) {
    const [search, setSearch] = useState<string>(args.search || "");

    return (
      <div className="flex gap-2">
        <MarketplaceSearchEngine
          variant="darkest"
          search={search}
          setSearch={setSearch}
        />
      </div>
    );
  },
};

export const Darker: Story = {
  render: function Render(args) {
    const [search, setSearch] = useState<string>(args.search || "");

    return (
      <div className="flex gap-2">
        <MarketplaceSearchEngine
          variant="darker"
          search={search}
          setSearch={setSearch}
        />
      </div>
    );
  },
};

export const Cards: Story = {
  render: function Render(args) {
    const [search, setSearch] = useState<string>(args.search || "");

    return (
      <div className="flex gap-2">
        <MarketplaceSearchEngine
          variant="darkest"
          search={search}
          setSearch={setSearch}
          cards={[
            <MarketplaceSearchCard
              image={<OlmechIcon variant="one" className="h-full w-full" />}
              label="ashe"
            />,
            <MarketplaceSearchCard
              image={<OlmechIcon variant="seven" className="h-full w-full" />}
              label="bal7hazar"
            />,
          ]}
        />
      </div>
    );
  },
};
