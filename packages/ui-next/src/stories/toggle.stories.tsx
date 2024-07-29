import { Toggle as UIToggle } from "@/components/primitives/toggle";
import { Meta, StoryObj } from "@storybook/react";
import { Bold } from "lucide-react";

const meta: Meta<typeof Toggle> = {
  title: "Toggle",
  component: Toggle,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Toggle>;

export const Default: Story = {};

function Toggle() {
  return (
    <UIToggle aria-label="Toggle bold">
      <Bold className="h-4 w-4" />
    </UIToggle>
  );
}
