import type { Meta, StoryObj } from "@storybook/react";
import { AchievementGroupHeader } from "./group-header";
import { fn } from "@storybook/test";

const meta: Meta<typeof AchievementGroupHeader> = {
  title: "Modules/Achievements/GroupHeader",
  component: AchievementGroupHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    achievements: [
      {
        id: "1",
        content: {
          icon: "fa-seedling",
          title: "Squire",
          description: "Every journey begins with a single step",
          points: 20,
          difficulty: 12,
          hidden: false,
          tasks: [
            { id: "1", count: 1, total: 1, description: "Finish onboarding" },
          ],
          timestamp: 1728717697,
        },
        pin: {
          pinned: true,
          onClick: fn(),
        },
      },
      {
        id: "2",
        content: {
          icon: "fa-scale-balanced",
          title: "Balance",
          description: "Other description",
          points: 20,
          difficulty: 12,
          hidden: false,
          tasks: [
            { id: "1", count: 1, total: 1, description: "Finish onboarding" },
          ],
          timestamp: 1728717697,
        },
        pin: {
          pinned: true,
          onClick: fn(),
        },
      },
    ],
    metadata: {
      name: "Game Name",
    },
    socials: {
      website: "http://game.gg",
      discord: "https://discord.gg/lootsurvivor",
      twitter: "https://x.com/lootsurvivor",
      github: "https://github.com/lootsurvivor",
      telegram: "https://t.me/lootsurvivor",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AchievementGroupHeader>;

export const Default: Story = {};

export const Faded: Story = {
  args: {
    variant: "faded",
  },
};

export const LootSurvivor: Story = {
  args: {
    variant: "default",
    achievements: [
      {
        id: "1",
        content: {
          icon: "fa-seedling",
          title: "Squire",
          description: "Every journey begins with a single step",
          points: 20,
          difficulty: 12,
          hidden: false,
          tasks: [
            { id: "1", count: 1, total: 1, description: "Finish onboarding" },
          ],
          timestamp: 1728717697,
        },
        pin: {
          pinned: true,
          onClick: fn(),
        },
      },
      {
        id: "2",
        content: {
          icon: "fa-scale-balanced",
          title: "Balance",
          description: "Other description",
          points: 20,
          difficulty: 12,
          hidden: false,
          tasks: [
            { id: "1", count: 1, total: 1, description: "Finish onboarding" },
          ],
          timestamp: 1728717697,
        },
        pin: {
          pinned: true,
          onClick: fn(),
        },
      },
    ],
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
};
