import type { Meta, StoryObj } from "@storybook/react";
import { MarketplacePropertyFilter } from "@/index";

const meta: Meta<typeof MarketplacePropertyFilter> = {
  title: "Modules/Marketplace/Property Filter",
  component: MarketplacePropertyFilter,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    label: "Property Name",
    count: 100,
  },
};

export default meta;
type Story = StoryObj<typeof MarketplacePropertyFilter>;

export const Default: Story = {
  render: () => {
    return (
      <div className="flex flex-col gap-px">
        <MarketplacePropertyFilter label="Property Name" count={100} />
        <MarketplacePropertyFilter
          label="Property Name"
          count={100}
          value={true}
        />
        <MarketplacePropertyFilter label="Property Name" count={100} />
        <MarketplacePropertyFilter
          label="Property Name"
          count={100}
          value={true}
        />
        <MarketplacePropertyFilter label="Property Name" count={100} />
        <MarketplacePropertyFilter label="Property Name" count={100} disabled />
        <MarketplacePropertyFilter
          label="Property Name"
          count={100}
          value={true}
          disabled
        />
      </div>
    );
  },
};

export const Unselected: Story = {
  args: {},
};

export const Selected: Story = {
  args: {
    value: true,
  },
};
