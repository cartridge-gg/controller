import type { Meta, StoryObj } from "@storybook/react";
import { PinAchievement } from "./pin";
import { fn } from "@storybook/test";

const meta: Meta<typeof PinAchievement> = {
  title: "Modules/Achievements/Pin",
  component: PinAchievement,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    pinned: false,
    loading: false,
    disabled: false,
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof PinAchievement>;

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
