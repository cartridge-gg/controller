import type { Meta, StoryObj } from "@storybook/react";
import { AchievementShare } from "./share";

const meta: Meta<typeof AchievementShare> = {
  title: "Modules/Achievements/Share",
  component: AchievementShare,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    disabled: false,
    website: "https://lootsurvivor.io",
    twitter: "https://x.com/lootsurvivor",
    timestamp: 1713542400,
    points: 100,
    difficulty: 10,
    title: "Achievement Title",
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
