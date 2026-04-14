import { Separator as UISeparator } from "@/components/primitives/separator";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Separator> = {
  title: "Primitives/Separator",
  component: Separator,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Separator>;

export const Default: Story = {};

function Separator() {
  return <UISeparator />;
}
