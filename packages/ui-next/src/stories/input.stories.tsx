import { Input as UIInput } from "@/components/primitives/input";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Input> = {
  title: "Input",
  component: Input,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};

function Input() {
  return <UIInput type="email" placeholder="Email" />;
}
