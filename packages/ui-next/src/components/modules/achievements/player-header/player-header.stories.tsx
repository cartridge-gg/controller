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
  },
};

export const OneFollower: Story = {
  args: {
    followers: ["clicksave"],
  },
};

export const TwoFollowers: Story = {
  args: {
    followers: ["clicksave", "shinobi"],
  },
};

export const ThreeFollowers: Story = {
  args: {
    followers: ["clicksave", "shinobi", "johndoe"],
  },
};
