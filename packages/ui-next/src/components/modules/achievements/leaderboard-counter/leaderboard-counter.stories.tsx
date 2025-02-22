import type { Meta, StoryObj } from "@storybook/react";
import { AchievementLeaderboardCounter } from "./leaderboard-counter";

const meta: Meta<typeof AchievementLeaderboardCounter> = {
  title: "Modules/Achievements/Leaderboard Counter",
  component: AchievementLeaderboardCounter,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    rank: 16,
  },
};

export default meta;
type Story = StoryObj<typeof AchievementLeaderboardCounter>;

export const Default: Story = {};

export const Active: Story = {
  args: {
    active: true,
  },
};
