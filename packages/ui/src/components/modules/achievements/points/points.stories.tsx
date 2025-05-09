import type { Meta, StoryObj } from "@storybook/react";
import { AchievementPoints } from "./points";

const meta: Meta<typeof AchievementPoints> = {
  title: "Modules/Achievements/Points",
  component: AchievementPoints,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    points: 20,
  },
};

export default meta;
type Story = StoryObj<typeof AchievementPoints>;

export const Default: Story = {};

export const Timestamp: Story = {
  args: {
    timestamp: 1728717697,
  },
};
