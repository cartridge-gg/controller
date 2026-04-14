import type { Meta, StoryObj } from "@storybook/react";
import { FollowerMark } from "./mark";

const meta: Meta<typeof FollowerMark> = {
  title: "Modules/Followers/Mark",
  component: FollowerMark,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    active: false,
  },
};

export default meta;
type Story = StoryObj<typeof FollowerMark>;

export const Default: Story = {};

export const Active: Story = {
  args: {
    active: true,
  },
};
