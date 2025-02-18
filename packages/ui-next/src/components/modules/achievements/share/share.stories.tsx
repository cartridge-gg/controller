import type { Meta, StoryObj } from "@storybook/react";
import { AchievementShare } from "./share";
import { fn } from "@storybook/test";

const meta: Meta<typeof AchievementShare> = {
  title: "Modules/Achievements/Share",
  component: AchievementShare,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    disabled: false,
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof AchievementShare>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
