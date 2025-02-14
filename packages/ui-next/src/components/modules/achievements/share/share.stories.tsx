import type { Meta, StoryObj } from "@storybook/react";
import { ShareAchievement } from "./share";
import { fn } from "@storybook/test";

const meta: Meta<typeof ShareAchievement> = {
  title: "Modules/Achievements/Share",
  component: ShareAchievement,
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
type Story = StoryObj<typeof ShareAchievement>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
