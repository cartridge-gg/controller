import type { Meta, StoryObj } from "@storybook/react";
import { AchievementLabel } from "./label";

const meta: Meta<typeof AchievementLabel> = {
  title: "Modules/Achievements/Label",
  component: AchievementLabel,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    icon: "fa-seedling",
    title: "Squire",
    points: 20,
    difficulty: 12,
    timestamp: 1728717697,
    completed: true,
  },
};

export default meta;
type Story = StoryObj<typeof AchievementLabel>;

export const Default: Story = {};

export const Uncompleted: Story = {
  args: {
    timestamp: undefined,
    completed: false,
  },
};

export const Hidden: Story = {
  args: {
    icon: undefined,
    title: "Hidden Achievement",
    timestamp: undefined,
    completed: false,
  },
};
