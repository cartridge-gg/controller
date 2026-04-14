import type { Meta, StoryObj } from "@storybook/react";
import { LeaderboardCounter } from "./counter";

const meta: Meta<typeof LeaderboardCounter> = {
  title: "Modules/Leaderboard/Counter",
  component: LeaderboardCounter,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    rank: 16,
  },
};

export default meta;
type Story = StoryObj<typeof LeaderboardCounter>;

export const Default: Story = {};

export const Active: Story = {
  args: {
    active: true,
  },
};
