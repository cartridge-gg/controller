import { useState } from "react";
import { toast } from "sonner";
import type { Meta, StoryObj } from "@storybook/react";
import { CollectibleCard, CollectibleCardProps } from ".";
import { fn } from "@storybook/test";

const meta: Meta<typeof CollectibleCard> = {
  title: "Modules/Collectibles/Card",
  component: CollectibleCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    icon: "https://static.cartridge.gg/presets/loot-survivor/icon.png",
    images: [
      "https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png",
    ],
    title: "Beasts",
    selected: false,
    onSelect: fn(),
    onClick: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof CollectibleCard>;

export const Collection: Story = {
  render: function Render(args: CollectibleCardProps) {
    const [selected, setSelected] = useState(false);

    return (
      <div className="flex gap-2">
        <CollectibleCard
          {...args}
          icon="https://static.cartridge.gg/presets/loot-survivor/icon.png"
          totalCount={1}
          selected={selected}
          onSelect={() => setSelected(!selected)}
          onClick={
            selected
              ? () => setSelected(!selected)
              : () => toast.success("Clicked")
          }
        />
      </div>
    );
  },
};

export const Beasts: Story = {
  render: function Render(args: CollectibleCardProps) {
    const [selected, setSelected] = useState(false);

    return (
      <div className="flex gap-2">
        <CollectibleCard
          {...args}
          icon="https://static.cartridge.gg/presets/loot-survivor/icon.png"
          images={[
            "https://api.cartridge.gg/x/arcade-main/torii/static/0x0158160018d590d93528995b340260e65aedd76d28a686e9daa5c4e8fad0c5dd/0x0000000000000000000000000000000000000000000000000000000000000001/image",
            "https://api.cartridge.gg/x/arcade-main/torii/static/0x158160018d590d93528995b340260e65aedd76d28a686e9daa5c4e8fad0c5dd/0x0000000000000000000000000000000000000000000000000000000000000001/image",
          ]}
          totalCount={1}
          selected={selected}
          onClick={
            selected
              ? () => setSelected(!selected)
              : () => toast.success("Clicked")
          }
        />
      </div>
    );
  },
};

export const Beast: Story = {
  render: function Render(args: CollectibleCardProps) {
    const [selected, setSelected] = useState(false);

    return (
      <div className="flex gap-2">
        <CollectibleCard
          {...args}
          icon={undefined}
          images={[
            "https://api.cartridge.gg/x/arcade-main/torii/static/0x046da8955829adf2bda310099a0063451923f02e648cf25a1203aac6335cf0e4/0x00000000000000000000000000000000000000000000000000000000000105de/image",
          ]}
          title='"Grim Sun" Hippogriff'
          totalCount={0}
          listingCount={1}
          selectable={true}
          selected={selected}
          onSelect={() => setSelected(!selected)}
          onClick={
            selected
              ? () => setSelected(!selected)
              : () => toast.success("Clicked")
          }
        />
      </div>
    );
  },
};

export const GoldenToken: Story = {
  render: function Render(args: CollectibleCardProps) {
    const [selected, setSelected] = useState(false);

    return (
      <div className="flex gap-2">
        <CollectibleCard
          {...args}
          icon={undefined}
          images={[
            "https://api.cartridge.gg/x/arcade-main/torii/static/0x04f5e296c805126637552cf3930e857f380e7c078e8f00696de4fc8545356b1d/0x0000000000000000000000000000000000000000000000000000000000000001/image",
            "https://api.cartridge.gg/x/arcade-main/torii/static/0x4f5e296c805126637552cf3930e857f380e7c078e8f00696de4fc8545356b1d/0x0000000000000000000000000000000000000000000000000000000000000001/image",
          ]}
          title="Golden Token"
          totalCount={0}
          listingCount={0}
          selectable={true}
          selected={selected}
          onSelect={() => setSelected(!selected)}
          onClick={selected ? () => setSelected(!selected) : undefined}
        />
      </div>
    );
  },
};

export const Karat: Story = {
  render: function Render(args: CollectibleCardProps) {
    const [selected, setSelected] = useState(false);

    return (
      <div className="flex gap-2">
        <CollectibleCard
          {...args}
          icon={null}
          images={[
            "https://api.cartridge.gg/x/arcade-main/torii/static/0x07d8ea58612a5de25f29281199a4fc1f2ce42f0f207f93c3a35280605f3b8e68/0x0000000000000000000000000000000000000000000000000000000000000001/image",
            "https://api.cartridge.gg/x/arcade-main/torii/static/0x7d8ea58612a5de25f29281199a4fc1f2ce42f0f207f93c3a35280605f3b8e68/0x0000000000000000000000000000000000000000000000000000000000000001/image",
          ]}
          title="Karat"
          totalCount={1}
          selectable={true}
          selected={selected}
          onSelect={() => setSelected(!selected)}
          onClick={selected ? () => setSelected(!selected) : undefined}
        />
      </div>
    );
  },
};

export const Bloberts: Story = {
  render: function Render(args: CollectibleCardProps) {
    const [selected, setSelected] = useState(false);

    return (
      <div className="flex gap-2">
        <CollectibleCard
          {...args}
          icon="https://static.cartridge.gg/presets/blob-arena-amma/icon.png"
          images={[
            "https://api.cartridge.gg/x/arcade-main/torii/static/0x00539f522b29ae9251dbf7443c7a950cf260372e69efab3710a11bf17a9599f1/0x0000000000000000000000000000000000000000000000000000000000000001/image",
            "https://api.cartridge.gg/x/arcade-main/torii/static/0x539f522b29ae9251dbf7443c7a950cf260372e69efab3710a11bf17a9599f1/0x0000000000000000000000000000000000000000000000000000000000000001/image",
          ]}
          title="Bloberts"
          totalCount={5}
          selectable={true}
          selected={selected}
          onSelect={() => setSelected(!selected)}
          onClick={selected ? () => setSelected(!selected) : undefined}
          backgroundColor="#C67927"
        />
      </div>
    );
  },
};

export const Duelists: Story = {
  render: function Render(args: CollectibleCardProps) {
    const [selected, setSelected] = useState(false);

    return (
      <div className="flex gap-2">
        <CollectibleCard
          {...args}
          icon="https://static.cartridge.gg/presets/pistols/icon.png"
          images={[
            "https://api.cartridge.gg/x/arcade-pistols/torii/static/0x07aaa9866750a0db82a54ba8674c38620fa2f967d2fbb31133def48e0527c87f/0x0000000000000000000000000000000000000000000000000000000000000577/image",
            "https://api.cartridge.gg/x/arcade-pistols/torii/static/0x7aaa9866750a0db82a54ba8674c38620fa2f967d2fbb31133def48e0527c87f/0x0000000000000000000000000000000000000000000000000000000000000577/image",
          ]}
          title="Pistols at Dawn Duelists"
          totalCount={1}
          selectable={true}
          selected={selected}
          onSelect={() => setSelected(!selected)}
          onClick={selected ? () => setSelected(!selected) : undefined}
          backgroundColor="#57493e"
        />
      </div>
    );
  },
};

export const Realms: Story = {
  render: function Render(args: CollectibleCardProps) {
    const [selected, setSelected] = useState(false);

    return (
      <div className="flex gap-2">
        <CollectibleCard
          {...args}
          icon="https://static.cartridge.gg/presets/eternum/icon.svg"
          images={[
            "https://api.cartridge.gg/x/arcade-main/torii/static/0x07ae27a31bb6526e3de9cf02f081f6ce0615ac12a6d7b85ee58b8ad7947a2809/0x0000000000000000000000000000000000000000000000000000000000001f40/image",
            "https://api.cartridge.gg/x/arcade-main/torii/static/0x7ae27a31bb6526e3de9cf02f081f6ce0615ac12a6d7b85ee58b8ad7947a2809/0x0000000000000000000000000000000000000000000000000000000000001f40/image",
          ]}
          title="Realms"
          totalCount={112}
          selectable={true}
          selected={selected}
          onSelect={() => setSelected(!selected)}
          onClick={selected ? () => setSelected(!selected) : undefined}
          backgroundColor="#ffffff"
        />
      </div>
    );
  },
};

export const Clickable: Story = {
  render: function Render(args: CollectibleCardProps) {
    return (
      <div className="flex gap-2">
        <CollectibleCard
          {...args}
          totalCount={2}
          selectable={false}
          selected={false}
          onSelect={undefined}
          onClick={() => toast.success("Clicked")}
        />
      </div>
    );
  },
};

export const Selected: Story = {
  args: {
    selectable: true,
    selected: true,
  },
};

export const Selectable: Story = {
  render: function Render(args: CollectibleCardProps) {
    const [selected, setSelected] = useState(false);

    return (
      <div className="flex gap-2">
        <CollectibleCard
          {...args}
          totalCount={2}
          selectable={true}
          selected={selected}
          onSelect={() => setSelected(!selected)}
          onClick={selected ? () => setSelected(!selected) : undefined}
        />
      </div>
    );
  },
};

export const Unselectable: Story = {
  args: {
    selectable: false,
    totalCount: 2,
  },
};

export const Price: Story = {
  args: {
    selected: false,
    price: "$2",
    lastSale: "",
  },
};

export const LastSale: Story = {
  args: {
    selected: false,
    price: "",
    lastSale: "$2",
  },
};

export const PriceLastSale: Story = {
  args: {
    selected: false,
    price: {
      value: "100",
      image:
        "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo",
    },
    lastSale: {
      value: "90",
      image:
        "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo",
    },
  },
};

export const FooterForced: Story = {
  args: {
    selected: false,
    price: null,
    lastSale: null,
  },
};
