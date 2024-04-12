import { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/primitives/button";

const meta: Meta<typeof Button> = {
  title: "Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: "text",
      description: "label",
    },
    disabled: {
      control: "boolean",
      description: "Gray out a button when disabled",
    },
    isLoading: {
      control: "boolean",
      description: "Show loading indicator.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "continue",
  },
};

export const Secondary: Story = {
  args: {
    children: "continue",
    variant: "secondary",
  },
};

export const Outline: Story = {
  args: {
    children: "continue",
    variant: "outline",
  },
};

export const Ghost: Story = {
  args: {
    children: "continue",
    variant: "ghost",
  },
};

export const Disabled: Story = {
  args: {
    children: "continue",
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: "continue",
    isLoading: true,
  },
};

export const Small: Story = {
  args: {
    children: "continue",
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    children: "continue",
    size: "default",
  },
};

export const Large: Story = {
  args: {
    children: "continue",
    size: "lg",
  },
};
