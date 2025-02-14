import type { Meta, StoryObj } from "@storybook/react";
import { AchievementIcon } from "./icon";

const meta: Meta<typeof AchievementIcon> = {
  title: "Modules/Achievements/Icon",
  component: AchievementIcon,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    icon: "fa-seedling",
    completed: true,
  },
};

export default meta;
type Story = StoryObj<typeof AchievementIcon>;

export const Default: Story = {};

export const Donkey: Story = {
  args: {
    icon: "fa-democrat",
    completed: false,
  },
};

export const Crest: Story = {
  args: {
    icon: "fa-khanda",
    completed: true,
  },
};

export const Knight: Story = {
  args: {
    icon: "fa-chess-knight",
    completed: false,
  },
};
