import type { Meta, StoryObj } from "@storybook/react";
import {
  ActivityCard,
  ActivityAchievementCard,
  ActivityGameCard,
  ActivityTokenCard,
  ActivityCollectibleCard,
} from "./";

const meta: Meta<typeof ActivityCard> = {
  title: "Modules/Activities/Card",
  component: ActivityCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof ActivityCard>;

export const Game: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <ActivityGameCard
        title="Attack"
        website="https://lootsurvivor.io"
        image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
      />
      <ActivityGameCard
        title="Attack"
        website="https://lootsurvivor.io"
        image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
        certified
      />
      <ActivityGameCard
        title="Attack"
        website="https://lootsurvivor.io"
        image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
        loading
      />
      <ActivityGameCard
        title="Attack"
        website="https://lootsurvivor.io"
        image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png"
        error
      />
    </div>
  ),
};

export const Achievement: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <ActivityAchievementCard
        title="Achievement"
        website="https://lootsurvivor.io"
        topic="Squire"
        points={20}
        image="fa-seedling"
      />
      <ActivityAchievementCard
        title="Achievement"
        website="https://lootsurvivor.io"
        topic="Squire"
        points={20}
        image="fa-seedling"
        certified
      />
      <ActivityAchievementCard
        title="Achievement"
        website="https://lootsurvivor.io"
        topic="Squire"
        points={20}
        image="fa-seedling"
        loading
      />
      <ActivityAchievementCard
        title="Achievement"
        website="https://lootsurvivor.io"
        topic="Squire"
        points={20}
        image="fa-seedling"
        error
      />
    </div>
  ),
};

export const Token: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <ActivityTokenCard
        amount="100 LORDS"
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        value="$6.04"
        image="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo"
        action="receive"
      />
      <ActivityTokenCard
        amount="100 LORDS"
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        value="$6.04"
        image="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo"
        action="send"
      />
      <ActivityTokenCard
        amount="100 LORDS"
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        value="$6.04"
        image="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo"
        action="mint"
      />
      <ActivityTokenCard
        amount="100 LORDS"
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        value="$6.04"
        image="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo"
        action="receive"
        loading
      />
      <ActivityTokenCard
        amount="100 LORDS"
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        value="$6.04"
        image="https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo"
        action="receive"
        error
      />
    </div>
  ),
};

export const Collectible: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <ActivityCollectibleCard
        name="Onyx Bane Ogre"
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        collection="Beast"
        image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
        action="receive"
      />
      <ActivityCollectibleCard
        name="Onyx Bane Ogre"
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        collection="Beast"
        image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
        action="send"
      />
      <ActivityCollectibleCard
        name="Onyx Bane Ogre"
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        collection="Beast"
        image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
        action="mint"
      />
      <ActivityCollectibleCard
        name="Onyx Bane Ogre"
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        collection="Beast"
        image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
        action="receive"
        loading
      />
      <ActivityCollectibleCard
        name="Onyx Bane Ogre"
        address="0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b"
        collection="Beast"
        image="https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png"
        action="receive"
        error
      />
    </div>
  ),
};
