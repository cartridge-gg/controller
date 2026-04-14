import type { Meta, StoryObj } from "@storybook/react";
import {
  MarketplacePropertyHeader,
  MarketplacePropertyFilter,
  MarketplaceSearchEngine,
} from "@/index";
import { useState } from "react";

const meta: Meta<typeof MarketplacePropertyHeader> = {
  title: "Modules/Marketplace/Property Header",
  component: MarketplacePropertyHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    label: "Name",
    count: 17,
  },
};

export default meta;
type Story = StoryObj<typeof MarketplacePropertyHeader>;

export const Default: Story = {
  render: function Render(args) {
    const [search, setSearch] = useState<string>("");

    return (
      <MarketplacePropertyHeader {...args}>
        <MarketplaceSearchEngine
          variant="darkest"
          search={search}
          setSearch={setSearch}
        />
        <div className="flex flex-col gap-px">
          <MarketplacePropertyFilter label="Property Name" count={100} />
          <MarketplacePropertyFilter label="Property Name" count={100} />
          <MarketplacePropertyFilter label="Property Name" count={100} />
          <MarketplacePropertyFilter label="Property Name" count={100} />
          <MarketplacePropertyFilter label="Property Name" count={100} />
        </div>
      </MarketplacePropertyHeader>
    );
  },
};
