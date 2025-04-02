import type { Meta, StoryObj } from "@storybook/react";
import { AchievementSummary } from "./summary";
import { fn } from "@storybook/test";

const meta: Meta<typeof AchievementSummary> = {
  title: "Modules/Achievements/Summary",
  component: AchievementSummary,
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
          points: 650,
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
        id: "3",
        content: {
          icon: "fa-scale-balanced",
          title: "Balance",
          description: "Other description",
          points: 10,
          difficulty: 12,
          hidden: false,
          tasks: [
            { id: "1", count: 1, total: 1, description: "Finish onboarding" },
          ],
          timestamp: 1728717697,
        },
      },
      {
        id: "4",
        content: {
          icon: "fa-scale-balanced",
          title: "Balance",
          description: "Other description",
          points: 10,
          difficulty: 12,
          hidden: false,
          tasks: [
            { id: "1", count: 1, total: 1, description: "Finish onboarding" },
          ],
          timestamp: 1728717697,
        },
      },
      {
        id: "5",
        content: {
          icon: "fa-scale-balanced",
          title: "Balance",
          description: "Other description",
          points: 10,
          difficulty: 12,
          hidden: false,
          tasks: [
            { id: "1", count: 1, total: 2, description: "Finish onboarding" },
          ],
        },
      },
      {
        id: "6",
        content: {
          icon: "fa-scale-balanced",
          title: "Balance",
          description: "Other description",
          points: 10,
          difficulty: 12,
          hidden: false,
          tasks: [
            { id: "1", count: 1, total: 2, description: "Finish onboarding" },
          ],
        },
      },
      {
        id: "7",
        content: {
          icon: "fa-scale-balanced",
          title: "Balance",
          description: "Other description",
          points: 10,
          difficulty: 12,
          hidden: false,
          tasks: [
            { id: "1", count: 1, total: 2, description: "Finish onboarding" },
          ],
        },
      },
      {
        id: "8",
        content: {
          icon: "fa-scale-balanced",
          title: "Balance",
          description: "Other description",
          points: 10,
          difficulty: 12,
          hidden: false,
          tasks: [
            { id: "1", count: 1, total: 2, description: "Finish onboarding" },
          ],
        },
      },
      {
        id: "9",
        content: {
          icon: "fa-scale-balanced",
          title: "Balance",
          description: "Other description",
          points: 10,
          difficulty: 12,
          hidden: false,
          tasks: [
            { id: "1", count: 1, total: 2, description: "Finish onboarding" },
          ],
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
      twitter: "https://x.com/lootsurvivor",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AchievementSummary>;

export const Default: Story = {};

export const Dark: Story = {
  args: {
    variant: "dark",
  },
};

export const Active: Story = {
  args: {
    active: true,
  },
};

export const NoCover: Story = {
  args: {
    metadata: {
      name: "Loot Survivor",
      logo: "https://raw.githubusercontent.com/cartridge-gg/presets/refs/heads/main/configs/loot-survivor/icon.png",
    },
  },
};

export const MultiColors: Story = {
  render: (args) => {
    return (
      <div className="flex flex-col gap-4">
        <AchievementSummary {...args} active color="#ff00ff" />
        <AchievementSummary {...args} active color="#00ff00" />
      </div>
    );
  },
};
