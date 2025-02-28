import type { Meta, StoryObj } from "@storybook/react";
import { AchievementPinIcons } from "./pin-icons";

const meta: Meta<typeof AchievementPinIcons> = {
  title: "Modules/Achievements/Pin Icons",
  component: AchievementPinIcons,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    pins: [
      {
        id: "1",
        icon: "fa-seedling",
      },
      {
        id: "2",
        icon: "fa-swords",
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof AchievementPinIcons>;

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

export const DefaultTheme: Story = {};

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
