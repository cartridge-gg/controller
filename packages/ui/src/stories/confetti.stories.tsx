import { Confetti as UIConfetti } from "@/components/primitives/confetti";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Confetti> = {
  title: "Primitives/Confetti",
  component: Confetti,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Confetti>;

export const Default: Story = {};

function Confetti() {
  return <UIConfetti className="w-full h-auto" />;
}
