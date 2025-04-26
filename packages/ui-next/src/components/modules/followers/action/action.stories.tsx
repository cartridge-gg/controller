import type { Meta, StoryObj } from "@storybook/react";
import { FollowerAction } from "./action";

const meta: Meta<typeof FollowerAction> = {
  title: "Modules/Followers/Action",
  component: FollowerAction,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    following: false,
  },
};

export default meta;
type Story = StoryObj<typeof FollowerAction>;

export const Default: Story = {};

export const Following: Story = {
  args: {
    following: true,
  },
};
