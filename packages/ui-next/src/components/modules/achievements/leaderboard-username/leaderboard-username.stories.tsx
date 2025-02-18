import type { Meta, StoryObj } from "@storybook/react";
import { AchievementLeaderboardUsername } from "./leaderboard-username";

const meta: Meta<typeof AchievementLeaderboardUsername> = {
  title: "Modules/Achievements/Leaderboard Username",
  component: AchievementLeaderboardUsername,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    username: "shinobi",
    highlight: false,
  },
};

export default meta;
type Story = StoryObj<typeof AchievementLeaderboardUsername>;

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

export const IconHighlight: Story = {
  args: {
    icon: "fa-helmet-battle",
    highlight: true,
  },
};
