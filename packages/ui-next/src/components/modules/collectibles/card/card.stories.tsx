import type { Meta, StoryObj } from "@storybook/react";
import { CollectibleCard } from ".";
import { fn } from "@storybook/test";
import { useState } from "react";

const meta: Meta<typeof CollectibleCard> = {
  title: "Modules/Collectibles/Card",
  component: CollectibleCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    image:
      "https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png",
    title: "Beasts",
    selected: false,
    onSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof CollectibleCard>;

export const Default: Story = {
  render: function Render(args) {
    const [selected, setSelected] = useState(false);

    return (
      <div className="flex gap-2">
        <CollectibleCard
          {...args}
          selected={selected}
          onSelect={() => setSelected(!selected)}
          onClick={selected ? () => setSelected(!selected) : undefined}
        />
      </div>
    );
  },
};

export const Selectable: Story = {
  render: function Render(args) {
    const [selected, setSelected] = useState(false);

    return (
      <div className="flex gap-2">
        <CollectibleCard
          {...args}
          selected={selected}
          onSelect={() => setSelected(!selected)}
          onClick={() => setSelected(!selected)}
        />
      </div>
    );
  },
};

export const Faded: Story = {
  args: {
    variant: "faded",
  },
};

export const Selected: Story = {
  args: {
    selected: true,
  },
};

export const Unselected: Story = {
  args: {
    selected: false,
  },
};
