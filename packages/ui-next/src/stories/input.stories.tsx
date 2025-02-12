import { Input } from "@/components/primitives/input";
import { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

const meta: Meta<typeof Input> = {
  title: "Primitives/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    type: "text",
    variant: "default",
    size: "default",
    placeholder: "Label",
    onClear: fn(),
    onChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Value: Story = {
  args: {
    value: "Value",
  },
};

export const Error: Story = {
  args: {
    value: "Value*",
    error: { name: "error", message: "Error" },
  },
};

export const AutoFocus: Story = {
  args: {
    value: "Value",
    autoFocus: true,
  },
};

export const BigDefault: Story = {
  args: {
    size: "lg",
  },
};

export const BigValue: Story = {
  args: {
    size: "lg",
    value: "Value",
  },
};

export const BigError: Story = {
  args: {
    size: "lg",
    value: "Value*",
    error: { name: "error", message: "Error" },
  },
};
