import { useState } from "react";
import { toast } from "sonner";
import type { Meta, StoryObj } from "@storybook/react";
import { InventoryItemCard, InventoryItemCardProps } from ".";
import { fn } from "@storybook/test";

const meta: Meta<typeof InventoryItemCard> = {
  title: "Modules/Collectibles/Inventory Item Card",
  component: InventoryItemCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    // icon: "https://static.cartridge.gg/presets/loot-survivor/icon.png",
    images: [
      "https://api.cartridge.gg/x/arcade-main/torii/static/0x046da8955829adf2bda310099a0063451923f02e648cf25a1203aac6335cf0e4/0x00000000000000000000000000000000000000000000000000000000000105de/image",
    ],
    title: '"Grim Sun" Hippogriff',
    listingCount: 1,
    onSelect: fn(),
    onClick: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof InventoryItemCard>;

export const Beast: Story = {
  render: function Render(args: InventoryItemCardProps) {
    const [selected, setSelected] = useState(false);

    return (
      <div className="flex gap-2">
        <InventoryItemCard
          {...args}
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
  render: function Render(args: InventoryItemCardProps) {
    const [selected, setSelected] = useState(false);

    return (
      <div className="flex gap-2">
        <InventoryItemCard
          {...args}
          images={[
            "https://api.cartridge.gg/x/arcade-main/torii/static/0x04f5e296c805126637552cf3930e857f380e7c078e8f00696de4fc8545356b1d/0x0000000000000000000000000000000000000000000000000000000000000001/image",
            "https://api.cartridge.gg/x/arcade-main/torii/static/0x4f5e296c805126637552cf3930e857f380e7c078e8f00696de4fc8545356b1d/0x0000000000000000000000000000000000000000000000000000000000000001/image",
          ]}
          title="Golden Token #77"
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
  render: function Render(args: InventoryItemCardProps) {
    const [selected, setSelected] = useState(false);

    return (
      <div className="flex gap-2">
        <InventoryItemCard
          {...args}
          images={[
            "https://api.cartridge.gg/x/arcade-main/torii/static/0x07d8ea58612a5de25f29281199a4fc1f2ce42f0f207f93c3a35280605f3b8e68/0x0000000000000000000000000000000000000000000000000000000000000001/image",
            "https://api.cartridge.gg/x/arcade-main/torii/static/0x7d8ea58612a5de25f29281199a4fc1f2ce42f0f207f93c3a35280605f3b8e68/0x0000000000000000000000000000000000000000000000000000000000000001/image",
          ]}
          title="Karat #123"
          selectable={true}
          selected={selected}
          onSelect={() => setSelected(!selected)}
          onClick={selected ? () => setSelected(!selected) : undefined}
        />
      </div>
    );
  },
};

export const Blobert: Story = {
  render: function Render(args: InventoryItemCardProps) {
    const [selected, setSelected] = useState(false);

    return (
      <div className="flex gap-2">
        <InventoryItemCard
          {...args}
          images={[
            "https://api.cartridge.gg/x/arcade-main/torii/static/0x00539f522b29ae9251dbf7443c7a950cf260372e69efab3710a11bf17a9599f1/0x0000000000000000000000000000000000000000000000000000000000000001/image",
            "https://api.cartridge.gg/x/arcade-main/torii/static/0x539f522b29ae9251dbf7443c7a950cf260372e69efab3710a11bf17a9599f1/0x0000000000000000000000000000000000000000000000000000000000000001/image",
          ]}
          title="Blobert #123"
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

export const Duelist: Story = {
  render: function Render(args: InventoryItemCardProps) {
    const [selected, setSelected] = useState(false);

    return (
      <div className="flex gap-2">
        <InventoryItemCard
          {...args}
          images={[
            "https://api.cartridge.gg/x/arcade-pistols/torii/static/0x07aaa9866750a0db82a54ba8674c38620fa2f967d2fbb31133def48e0527c87f/0x0000000000000000000000000000000000000000000000000000000000000577/image",
            "https://api.cartridge.gg/x/arcade-pistols/torii/static/0x7aaa9866750a0db82a54ba8674c38620fa2f967d2fbb31133def48e0527c87f/0x0000000000000000000000000000000000000000000000000000000000000577/image",
          ]}
          title="Pistols at Dawn Duelist #1399"
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

export const Realm: Story = {
  render: function Render(args: InventoryItemCardProps) {
    const [selected, setSelected] = useState(false);

    return (
      <div className="flex gap-2">
        <InventoryItemCard
          {...args}
          images={[
            "https://api.cartridge.gg/x/arcade-main/torii/static/0x07ae27a31bb6526e3de9cf02f081f6ce0615ac12a6d7b85ee58b8ad7947a2809/0x0000000000000000000000000000000000000000000000000000000000001f40/image",
            "https://api.cartridge.gg/x/arcade-main/torii/static/0x7ae27a31bb6526e3de9cf02f081f6ce0615ac12a6d7b85ee58b8ad7947a2809/0x0000000000000000000000000000000000000000000000000000000000001f40/image",
          ]}
          title="Shmasmessel"
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

export const DopeWarsGearSingle: Story = {
  render: function Render(args: InventoryItemCardProps) {
    return (
      <div className="flex gap-2">
        <InventoryItemCard
          {...args}
          images={[
            "https://raw2.seadn.io/optimism/0x0e55e1913c50e015e0f60386ff56a4bfb00d7110/448cb89b7c9c6673de179a7d5bef21/b8448cb89b7c9c6673de179a7d5bef21.svg",
          ]}
          title="Rolls Royce from Mob Town"
          selectable={false}
          selected={false}
          onSelect={undefined}
          onClick={() => toast.success("Clicked")}
          backgroundColor="#97ADCC"
          totalCount={1}
        />
      </div>
    );
  },
};

export const DopeWarsGearMultiple: Story = {
  render: function Render(args: InventoryItemCardProps) {
    return (
      <div className="flex gap-2">
        <InventoryItemCard
          {...args}
          images={[
            "https://raw2.seadn.io/optimism/0x0e55e1913c50e015e0f60386ff56a4bfb00d7110/448cb89b7c9c6673de179a7d5bef21/b8448cb89b7c9c6673de179a7d5bef21.svg",
          ]}
          title="Rolls Royce from Mob Town"
          selectable={false}
          selected={false}
          onSelect={undefined}
          onClick={() => toast.success("Clicked")}
          backgroundColor="#97ADCC"
          totalCount={3}
        />
      </div>
    );
  },
};

export const Clickable: Story = {
  render: function Render(args: InventoryItemCardProps) {
    return (
      <div className="flex gap-2">
        <InventoryItemCard
          {...args}
          listingCount={0}
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
    listingCount: 0,
  },
};

export const Selectable: Story = {
  render: function Render(args: InventoryItemCardProps) {
    const [selected, setSelected] = useState(false);

    return (
      <div className="flex gap-2">
        <InventoryItemCard
          {...args}
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

export const Unselectable: Story = {
  args: {
    selectable: false,
    selected: false,
    listingCount: 0,
  },
};

export const BadUrl: Story = {
  args: {
    images: ["/this_image_does_not_exist.png"],
    selectable: false,
  },
};

export const BadUrlWithFallback: Story = {
  args: {
    images: [
      "/this_image_does_not_exist.png",
      "https://static.cartridge.gg/presets/loot-survivor/icon.png",
    ],
    selectable: false,
  },
};

export const IpfsUnpinnedFile: Story = {
  args: {
    images: [
      "https://ipfs.io/ipfs/QmWqqT4awbuzaHM7e5EBf9GGzNDQRz4WauUDSctVe9ZeBW",
    ],
  },
};
