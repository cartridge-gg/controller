import type { Meta, StoryObj } from "@storybook/react";
import { AchievementPlayerHeader } from "./player-header";

const meta: Meta<typeof AchievementPlayerHeader> = {
  title: "Modules/Achievements/Player Header",
  component: AchievementPlayerHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },

  args: {
    username: "bal7hazar",
    address: "0x1234567890123456789012345678901234567890",
    points: 2800,
    follower: true,
    followerCount: 1337,
    followingCount: 42,
    followers: [
      "clicksave",
      "shinobi",
      "johndoe",
      "janedoe",
      "harrypotter",
      "hermione",
      "ron",
      "aragorn",
      "legolas",
      "gimli",
      "boromir",
      "gandalf",
      "frodo",
      "sam",
      "merry",
      "pippin",
      "boromir",
      "gandalf",
      "frodo",
      "sam",
      "merry",
      "pippin",
    ],
  },
};

export default meta;
type Story = StoryObj<typeof AchievementPlayerHeader>;

export const Default: Story = {};

export const NotFollower: Story = {
  args: {
    follower: false,
  },
};

export const NoFollowers: Story = {
  args: {
    followers: [],
    followerCount: 0,
    followingCount: 0,
  },
};

export const OneFollower: Story = {
  args: {
    followers: ["clicksave"],
    followerCount: 1,
    followingCount: 1,
  },
};

export const TwoFollowers: Story = {
  args: {
    followers: ["clicksave", "shinobi"],
    followerCount: 2,
    followingCount: 2,
  },
};

export const ThreeFollowers: Story = {
  args: {
    followers: ["clicksave", "shinobi", "johndoe"],
    followerCount: 3,
    followingCount: 3,
  },
};

export const Compacted: Story = {
  args: {
    follower: false,
    compacted: true,
  },
};

export const Silver: Story = {
  args: {
    follower: true,
    variant: "silver",
  },
};

export const GoldCompacted: Story = {
  args: {
    follower: false,
    compacted: true,
    variant: "gold",
  },
};
