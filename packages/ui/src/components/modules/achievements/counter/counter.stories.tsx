import type { Meta, StoryObj } from "@storybook/react";
import { AchievementCounter } from "./counter";

const meta: Meta<typeof AchievementCounter> = {
  title: "Modules/Achievements/Counter",
  component: AchievementCounter,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    count: 4,
    total: 10,
  },
};

export default meta;
type Story = StoryObj<typeof AchievementCounter>;

export const Default: Story = {};

export const Active: Story = {
  args: {
    active: true,
  },
};
