import type { Meta, StoryObj } from "@storybook/react";
import { FeaturedAchievement } from "./featured";

const meta: Meta<typeof FeaturedAchievement> = {
  title: "Modules/Achievements/Featured",
  component: FeaturedAchievement,
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
type Story = StoryObj<typeof FeaturedAchievement>;

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
