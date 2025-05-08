import type { Meta, StoryObj } from "@storybook/react";
import { AchievementPin } from "./pin";
import { fn } from "@storybook/test";

const meta: Meta<typeof AchievementPin> = {
  title: "Modules/Achievements/Pin",
  component: AchievementPin,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    pinned: false,
    disabled: false,
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof AchievementPin>;

export const Default: Story = {};

export const Active: Story = {
  args: {
    pinned: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
