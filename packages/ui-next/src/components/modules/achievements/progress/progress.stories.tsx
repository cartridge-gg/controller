import type { Meta, StoryObj } from "@storybook/react";
import { AchievementProgress } from "./progress";

const meta: Meta<typeof AchievementProgress> = {
  title: "Modules/Achievements/Progress",
  component: AchievementProgress,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    count: 4,
    total: 9,
    points: 690,
  },
};

export default meta;
type Story = StoryObj<typeof AchievementProgress>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    count: 0,
    points: 0,
  },
};

export const Complete: Story = {
  args: {
    count: 9,
    total: 9,
    points: 690,
    completed: true,
  },
};

export const Verbose: Story = {
  args: {
    count: 400,
    total: 9000,
    points: 1234567890,
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
  },
};
