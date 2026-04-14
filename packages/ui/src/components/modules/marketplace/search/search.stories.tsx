import type { Meta, StoryObj } from "@storybook/react";
import { MarketplaceSearch, OlmechIcon, SearchResult } from "@/index";
import { useMemo, useState } from "react";

const meta: Meta<typeof MarketplaceSearch> = {
  title: "Modules/Marketplace/Search",
  component: MarketplaceSearch,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    search: "a",
  },
};

const data: SearchResult[] = [
  {
    image: <OlmechIcon variant="one" className="h-full w-full" />,
    label: "ashe",
  },
  {
    image: <OlmechIcon variant="two" className="h-full w-full" />,
    label: "ashetest",
  },
  {
    image: <OlmechIcon variant="three" className="h-full w-full" />,
    label: "bal7hazar",
  },
  {
    image: <OlmechIcon variant="four" className="h-full w-full" />,
    label: "yourwurstknightmare-yourwurstknightmare",
  },
];

export default meta;
type Story = StoryObj<typeof MarketplaceSearch>;

export const Darkest: Story = {
  render: function Render(args) {
    const [search, setSearch] = useState<string>(args.search || "");
    const [selected, setSelected] = useState<SearchResult | undefined>(
      undefined,
    );
    const options = useMemo(() => {
      if (!search) return [];
      return data.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase()),
      );
    }, [search]);

    return (
      <MarketplaceSearch
        search={search}
        setSearch={setSearch}
        selected={selected}
        setSelected={setSelected}
        options={options}
        variant="darkest"
        className="w-[200px] lg:w-[240px]"
      />
    );
  },
};

export const Darker: Story = {
  render: function Render(args) {
    const [search, setSearch] = useState<string>(args.search || "");
    const [selected, setSelected] = useState<SearchResult | undefined>(
      undefined,
    );
    const options = useMemo(() => {
      if (!search) return [];
      return data.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase()),
      );
    }, [search]);

    return (
      <MarketplaceSearch
        search={search}
        setSearch={setSearch}
        selected={selected}
        setSelected={setSelected}
        options={options}
        variant="darker"
        className="w-[200px] md:w-[240px]"
      />
    );
  },
};
