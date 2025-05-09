import type { Meta, StoryObj } from "@storybook/react";
import { TraceabilityCard, TraceabilityCollectibleCard } from ".";

const meta: Meta<typeof TraceabilityCard> = {
  title: "Modules/Traceabilities/Card",
  component: TraceabilityCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof TraceabilityCard>;

export const Collectible: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <TraceabilityCollectibleCard
        from="0x041a...123b"
        to="0x041a...123b"
        amount={1}
        image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
        action="receive"
      />
      <TraceabilityCollectibleCard
        from="0x041a...123b"
        to="0x041a...123b"
        amount={2}
        image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
        action="send"
      />
      <TraceabilityCollectibleCard
        from="0x041a...123b"
        to="0x041a...123b"
        amount={3}
        image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
        action="mint"
      />
      <TraceabilityCollectibleCard
        from="0x041a...123b"
        to="0x041a...123b"
        amount={4}
        image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
        action="receive"
        loading
      />
      <TraceabilityCollectibleCard
        from="0x041a...123b"
        to="0x041a...123b"
        amount={10}
        image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
        action="receive"
        error
      />
    </div>
  ),
};
