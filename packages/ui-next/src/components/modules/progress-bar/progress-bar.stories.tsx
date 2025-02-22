import type { Meta, StoryObj } from "@storybook/react";
import { ProgressBar } from "./progress-bar";

const meta: Meta<typeof ProgressBar> = {
  title: "Modules/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    count: 2,
    total: 2,
    completed: true,
  },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {};

export const DefaultUncompleted: Story = {
  args: {
    completed: false,
  },
};

export const HalfCompleted: Story = {
  args: {
    count: 1,
    completed: true,
  },
};

export const HalfUncompleted: Story = {
  args: {
    count: 1,
    completed: false,
  },
};

export const Empty: Story = {
  args: {
    count: 0,
    completed: false,
  },
};
