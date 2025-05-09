import type { Meta, StoryObj } from "@storybook/react";
import { AchievementProgress } from "./progress";

const meta: Meta<typeof AchievementProgress> = {
  title: "Modules/Achievements/Progress",
  component: AchievementProgress,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    count: 4,
    total: 9,
    points: 690,
  },
};

export default meta;
type Story = StoryObj<typeof AchievementProgress>;

const variants = [
  "darkest",
  "darker",
  "dark",
  "default",
  "light",
  "lighter",
  "lightest",
  "ghost",
] as const;

export const Default: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {variants.map((variant) => (
        <div key={variant} className="grid grid-cols-4 items-center">
          <p className="text-sm text-foreground-100 capitalize text-medium">
            {variant}
          </p>
          <div className="col-span-3">
            <AchievementProgress key={variant} {...args} variant={variant} />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Empty: Story = {
  args: {
    count: 0,
    points: 0,
  },
};

export const Complete: Story = {
  args: {
    count: 9,
    total: 9,
    points: 690,
    completed: true,
  },
};

export const Verbose: Story = {
  args: {
    count: 400,
    total: 9000,
    points: 1234567890,
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
  },
};
