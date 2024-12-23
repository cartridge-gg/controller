import { Input } from "@/components/primitives/input";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Input> = {
  title: "Input",
  component: Input,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    type: "email",
    placeholder: "Email",
  },
};

export const Loading: Story = {
  args: {
    value: "Some text value",
    isLoading: true,
  },
};

export const Clear: Story = {
  args: {
    value: "Some text value",
    onClear: () => {
      console.log("cleared!");
    },
  },
};
