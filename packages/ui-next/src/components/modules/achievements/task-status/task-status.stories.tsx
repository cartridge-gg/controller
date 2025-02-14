import type { Meta, StoryObj } from "@storybook/react";
import { TaskStatusAchievement } from "./task-status";

const meta: Meta<typeof TaskStatusAchievement> = {
  title: "Modules/Achievements/Status",
  component: TaskStatusAchievement,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    count: 1,
    total: 2,
  },
};

export default meta;
type Story = StoryObj<typeof TaskStatusAchievement>;

export const Default: Story = {};

export const Completed: Story = {
  args: {
    count: 2,
  },
};

export const Single: Story = {
  args: {
    count: 0,
    total: 1,
  },
};

export const SingleCompleted: Story = {
  args: {
    count: 1,
    total: 1,
  },
};

export const Large: Story = {
  args: {
    count: 1000000,
    total: 2000000,
  },
};

export const LargeCompleted: Story = {
  args: {
    count: 2000000,
  },
};
