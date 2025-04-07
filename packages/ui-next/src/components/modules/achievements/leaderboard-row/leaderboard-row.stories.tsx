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

export const HighlightTop1: Story = {
  args: {
    highlight: true,
    rank: 1,
  },
};

export const Top1: Story = {
  args: {
    rank: 1,
  },
};

export const Top2: Story = {
  args: {
    rank: 2,
  },
};

export const Top3: Story = {
  args: {
    rank: 3,
  },
};

export const LowRank: Story = {
  args: {
    rank: 9999,
  },
};
