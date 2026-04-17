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
        username="shinobi"
        timestamp={1}
        category="list"
        collectibleImage="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
        collectibleName="Adventurer #8"
        currencyImage="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo"
        amount={50000}
        quantity={2}
      />
      <TraceabilityCollectibleCard
        username="shinobi"
        timestamp={1}
        category="sale"
        collectibleImage="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
        collectibleName="Adventurer #8"
        currencyImage="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo"
        amount={50000}
        quantity={1}
      />
      <TraceabilityCollectibleCard
        username="bal7hazar"
        timestamp={1}
        category="list"
        collectibleImage="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
        collectibleName="Adventurer #8"
        currencyImage="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo"
        amount={50000}
      />
      <TraceabilityCollectibleCard
        username="bal7hazar"
        timestamp={1}
        category="receive"
        collectibleImage="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
        collectibleName="Adventurer #8"
      />
      <TraceabilityCollectibleCard
        username="tedison"
        timestamp={1}
        category="send"
        collectibleImage="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
        collectibleName="Adventurer #8"
      />
      <TraceabilityCollectibleCard
        username="tedison"
        timestamp={1}
        category="mint"
        collectibleImage="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
        collectibleName="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos."
        amount={50000.123456789}
      />
    </div>
  ),
};
