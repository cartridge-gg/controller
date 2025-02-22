import type { Meta, StoryObj } from "@storybook/react";
import { AchievementLeaderboardRow } from "./leaderboard-row";

const meta: Meta<typeof AchievementLeaderboardRow> = {
  title: "Modules/Achievements/Leaderboard Row",
  component: AchievementLeaderboardRow,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    rank: 100,
    name: "player",
    highlight: false,
    points: 690,
    pins: [
      { id: "1", icon: "fa-seedling" },
      { id: "2", icon: "fa-swords" },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof AchievementLeaderboardRow>;

export const Default: Story = {};

export const Icon: Story = {
  args: {
    icon: "fa-helmet-battle",
  },
};

export const Highlight: Story = {
  args: {
    highlight: true,
  },
};

export const LowRank: Story = {
  args: {
    rank: 1,
  },
};

export const HighRank: Story = {
  args: {
    rank: 9999,
  },
};
