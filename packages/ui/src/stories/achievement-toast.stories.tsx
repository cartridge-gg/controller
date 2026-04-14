import type { Meta, StoryObj } from "@storybook/react";
import { AchievementToast } from "@/components/primitives/toast/specialized-toasts";

const meta: Meta<typeof AchievementToast> = {
  title: "Primitives/Toast/Achievement Toast",
  component: AchievementToast,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#353535" },
        { name: "light", value: "#ffffff" },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    title: { control: "text" },
    subtitle: { control: "text" },
    xpAmount: { control: "number" },
    progress: { control: { type: "range", min: 0, max: 100, step: 1 } },
    isDraft: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof AchievementToast>;

export const PacifistPath: Story = {
  args: {
    title: "Pacifist Path",
    subtitle: "Earned!",
    xpAmount: 100,
    progress: 66.7,
    isDraft: false,
  },
};

export const DiamondsDraft: Story = {
  args: {
    title: "Diamonds",
    subtitle: "Earned!",
    xpAmount: 100,
    progress: 16.7,
    isDraft: true,
  },
};

export const CustomAchievement: Story = {
  args: {
    title: "Master Explorer",
    subtitle: "Unlocked!",
    xpAmount: 250,
    progress: 100,
    isDraft: false,
  },
};
