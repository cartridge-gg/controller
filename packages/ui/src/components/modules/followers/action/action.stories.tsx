import type { Meta, StoryObj } from "@storybook/react";
import { FollowerAction } from "./action";
import FollowerFollow from "./follow";
import FollowerUnfollow from "./unfollow";
import FollowerFollowing from "./following";

const meta: Meta<typeof FollowerAction> = {
  title: "Modules/Followers/Action",
  component: FollowerAction,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof FollowerAction>;

export const Follow: Story = {
  render: () => <FollowerFollow loading={false} disabled={false} />,
};

export const Following: Story = {
  render: () => <FollowerFollowing />,
};

export const Unfollow: Story = {
  render: () => <FollowerUnfollow loading={false} disabled={false} />,
};
