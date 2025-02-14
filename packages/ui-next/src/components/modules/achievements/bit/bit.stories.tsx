import type { Meta, StoryObj } from "@storybook/react";
import { BitAchievement } from "./bit";
import { fn } from "@storybook/test";

const meta: Meta<typeof BitAchievement> = {
  title: "Modules/Achievements/Bit",
  component: BitAchievement,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    completed: false,
    active: false,
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof BitAchievement>;

export const Default: Story = {};

export const Completed: Story = {
  args: {
    completed: true,
  },
};

export const Active: Story = {
  args: {
    active: true,
  },
};

export const ActiveCompleted: Story = {
  args: {
    completed: true,
    active: true,
  },
};
