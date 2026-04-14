import type { Meta, StoryObj } from "@storybook/react";
import { LeaderboardUsername } from "./username";

const meta: Meta<typeof LeaderboardUsername> = {
  title: "Modules/Leaderboard/Username",
  component: LeaderboardUsername,
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
type Story = StoryObj<typeof LeaderboardUsername>;

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
