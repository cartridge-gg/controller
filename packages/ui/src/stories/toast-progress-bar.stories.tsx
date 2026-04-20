import type { Meta, StoryObj } from "@storybook/react";
import { ToastProgressBar } from "@/components/primitives/toast/specialized-toasts";

const meta: Meta<typeof ToastProgressBar> = {
  title: "Primitives/Toast/Supporting/Toast Progress Bar",
  component: ToastProgressBar,
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
  argTypes: {
    progress: { control: { type: "range", min: 0, max: 100, step: 1 } },
    variant: {
      control: "select",
      options: ["achievement", "error"],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ToastProgressBar>;

export const AchievementProgress: Story = {
  args: {
    progress: 66.7,
    variant: "achievement",
  },
};

export const ErrorProgress: Story = {
  args: {
    progress: 66.7,
    variant: "error",
  },
};

export const EmptyProgress: Story = {
  args: {
    progress: 0,
    variant: "achievement",
  },
};

export const FullProgress: Story = {
  args: {
    progress: 100,
    variant: "achievement",
  },
};

export const ProgressComparison: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-white text-sm font-semibold mb-2">
          Achievement Progress
        </h3>
        <div className="space-y-2">
          <div className="w-[360px]">
            <ToastProgressBar progress={25} variant="achievement" />
            <p className="text-white text-xs mt-1">25%</p>
          </div>
          <div className="w-[360px]">
            <ToastProgressBar progress={50} variant="achievement" />
            <p className="text-white text-xs mt-1">50%</p>
          </div>
          <div className="w-[360px]">
            <ToastProgressBar progress={75} variant="achievement" />
            <p className="text-white text-xs mt-1">75%</p>
          </div>
          <div className="w-[360px]">
            <ToastProgressBar progress={100} variant="achievement" />
            <p className="text-white text-xs mt-1">100%</p>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-white text-sm font-semibold mb-2">
          Error Progress
        </h3>
        <div className="space-y-2">
          <div className="w-[360px]">
            <ToastProgressBar progress={25} variant="error" />
            <p className="text-white text-xs mt-1">25%</p>
          </div>
          <div className="w-[360px]">
            <ToastProgressBar progress={50} variant="error" />
            <p className="text-white text-xs mt-1">50%</p>
          </div>
          <div className="w-[360px]">
            <ToastProgressBar progress={75} variant="error" />
            <p className="text-white text-xs mt-1">75%</p>
          </div>
        </div>
      </div>
    </div>
  ),
};
