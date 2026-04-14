import type { Meta, StoryObj } from "@storybook/react";
import { LeaderboardRow } from "./row";
import { fn } from "@storybook/test";

const meta: Meta<typeof LeaderboardRow> = {
  title: "Modules/Leaderboard/Row",
  component: LeaderboardRow,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    rank: 100,
    name: "player",
    highlight: false,
    points: 690,
    following: true,
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof LeaderboardRow>;

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
