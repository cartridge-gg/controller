import { MoonIcon } from "@/components/icons";
import { Toggle as UIToggle } from "@/components/primitives/toggle";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Toggle> = {
  title: "Primitives/Toggle",
  component: Toggle,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Toggle>;

export const Default: Story = {};

function Toggle() {
  return (
    <UIToggle aria-label="Toggle bold">
      <MoonIcon variant="solid" />
    </UIToggle>
  );
}
