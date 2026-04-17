import type { Meta, StoryObj } from "@storybook/react";
import { AchievementTaskHeader } from "./task-header";

const meta: Meta<typeof AchievementTaskHeader> = {
  title: "Modules/Achievements/TaskHeader",
  component: AchievementTaskHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    count: 1,
    total: 2,
    description: "TaskHeader description",
  },
};

export default meta;
type Story = StoryObj<typeof AchievementTaskHeader>;

export const Default: Story = {};

export const Completed: Story = {
  args: {
    count: 2,
  },
};

export const Long: Story = {
  args: {
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
};

export const LongCompleted: Story = {
  args: {
    count: 2,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
};
