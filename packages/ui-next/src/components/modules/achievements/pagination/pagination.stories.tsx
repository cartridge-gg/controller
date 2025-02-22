import type { Meta, StoryObj } from "@storybook/react";
import { AchievementPagination } from "./pagination";
import { fn } from "@storybook/test";

const meta: Meta<typeof AchievementPagination> = {
  title: "Modules/Achievements/Pagination",
  component: AchievementPagination,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof AchievementPagination>;

export const DefaultLeft: Story = {
  args: {
    direction: "left",
  },
};

export const DefaultRight: Story = {
  args: {
    direction: "right",
  },
};

export const DisabledLeft: Story = {
  args: {
    direction: "left",
    disabled: true,
  },
};

export const DisabledRight: Story = {
  args: {
    direction: "right",
    disabled: true,
  },
};
