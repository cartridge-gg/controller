import type { Meta, StoryObj } from "@storybook/react";
import { AchievementFeatured } from "./featured";

const meta: Meta<typeof AchievementFeatured> = {
  title: "Modules/Achievements/Featured",
  component: AchievementFeatured,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    icon: "fa-seedling",
    title: "Featured",
  },
};

export default meta;
type Story = StoryObj<typeof AchievementFeatured>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    icon: undefined,
    title: undefined,
  },
};

export const Medium: Story = {
  args: {
    icon: "fa-seedling",
    title: "Featured Achievement",
  },
};

export const Long: Story = {
  args: {
    icon: "fa-seedling",
    title: "Featured Achievement Detailed",
  },
};
