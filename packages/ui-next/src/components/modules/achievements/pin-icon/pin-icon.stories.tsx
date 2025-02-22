import type { Meta, StoryObj } from "@storybook/react";
import { AchievementPinIcon } from "./pin-icon";

const meta: Meta<typeof AchievementPinIcon> = {
  title: "Modules/Achievements/Pin Icon",
  component: AchievementPinIcon,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    variant: "default",
    size: "default",
    status: "default",
    icon: "fa-seedling",
    empty: false,
  },
};

export default meta;
type Story = StoryObj<typeof AchievementPinIcon>;

export const Default: Story = {};

export const Highlight: Story = {
  args: {
    status: "highlight",
  },
};

export const Missing: Story = {
  args: {
    icon: undefined,
  },
};

export const Empty: Story = {
  args: {
    empty: true,
  },
};

export const EmptyHighlight: Story = {
  args: {
    empty: true,
    status: "highlight",
  },
};

export const Faded: Story = {
  args: {
    variant: "faded",
  },
};
