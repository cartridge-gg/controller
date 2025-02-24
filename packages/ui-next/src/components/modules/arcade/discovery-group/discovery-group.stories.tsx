import type { Meta, StoryObj } from "@storybook/react";
import { ArcadeDiscoveryGroup } from "./discovery-group";

const meta: Meta<typeof ArcadeDiscoveryGroup> = {
  title: "Modules/Arcade/Discovery Group",
  component: ArcadeDiscoveryGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    game: {
      metadata: {
        name: "Loot Survivor",
        logo: "https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png",
        cover:
          "https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/cover.png",
      },
      socials: {
        website: "https://lootsurvivor.io/",
        discord: "https://discord.gg/lootsurvivor",
        twitter: "https://x.com/lootsurvivor",
      },
    },
    events: [
      {
        name: "bal7hazar",
        achievement: {
          title: "Squire",
          icon: "fa-seedling",
        },
        timestamp: 1740388686,
      },
      {
        name: "karyi",
        achievement: {
          title: "Squire",
          icon: "fa-seedling",
        },
        timestamp: 1740288686,
      },
      {
        name: "ashe",
        achievement: {
          title: "Squire",
          icon: "fa-seedling",
        },
        timestamp: 1740188686,
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof ArcadeDiscoveryGroup>;

export const Default: Story = {};
