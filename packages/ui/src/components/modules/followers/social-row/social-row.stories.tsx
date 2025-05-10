import type { Meta, StoryObj } from "@storybook/react";
import { FollowerSocialRow } from "./social-row";
import { fn } from "@storybook/test";

const meta: Meta<typeof FollowerSocialRow> = {
  title: "Modules/Followers/Social Row",
  component: FollowerSocialRow,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    username: "shinobi",
    points: 950,
    following: false,
    unfollowable: false,
    onSocialClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof FollowerSocialRow>;

export const Default: Story = {};

export const Following: Story = {
  args: {
    following: true,
  },
};

export const Unfollowable: Story = {
  args: {
    following: true,
    unfollowable: true,
  },
};
