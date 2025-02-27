import type { Meta, StoryObj } from "@storybook/react";
import { AchievementPinIcon } from "./pin-icon";

const meta: Meta<typeof AchievementPinIcon> = {
  title: "Modules/Achievements/Pin Icon",
  component: AchievementPinIcon,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    variant: "default",
    size: "default",
    icon: "fa-seedling",
    empty: false,
  },
};

export default meta;
type Story = StoryObj<typeof AchievementPinIcon>;

export const Default: Story = {};

export const Faded: Story = {
  args: {
    variant: "faded",
  },
};

export const Highlight: Story = {
  args: {
    variant: "highlight",
  },
};

export const DefaultTheme: Story = {
  args: {
    theme: true,
  },
};

export const FadedTheme: Story = {
  args: {
    variant: "faded",
    theme: true,
  },
};

export const HighlightTheme: Story = {
  args: {
    variant: "highlight",
    theme: true,
  },
};

export const DefaultEmpty: Story = {
  args: {
    empty: true,
  },
};

export const FadedEmpty: Story = {
  args: {
    empty: true,
    variant: "faded",
  },
};

export const HighlightEmpty: Story = {
  args: {
    empty: true,
    variant: "highlight",
  },
};

export const Missing: Story = {
  args: {
    icon: undefined,
  },
};
