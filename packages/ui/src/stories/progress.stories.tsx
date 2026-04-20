import { Progress as UIProgress } from "@/components/primitives/progress";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Progress> = {
  title: "Primitives/Progress",
  component: Progress,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Progress>;

export const Default: Story = {};

function Progress() {
  return <UIProgress value={33} />;
}
