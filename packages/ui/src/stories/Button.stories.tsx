import { Button } from "@chakra-ui/react";
import { Meta, StoryObj } from "@storybook/react";

/**
 *
 * Collection of buttons.
 */
const meta: Meta<typeof Button> = {
  title: "Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: "text",
      description: "Button label",
    },
    variant: {
      control: "select",
      description: "Variable of buttons",
      options: ["solid"],
    },
    colorScheme: {
      control: "select",
      description: "Custom color scheme.",
      options: ["colorful", "translucent", "light", "dark"],
    },
    size: {
      control: "select",
      description: "Select size",
      options: ["sm", "md", "lg"],
    },
    isDisabled: {
      control: "boolean",
      description: "Gray out a button when disabled",
    },
    isLoading: {
      control: "boolean",
      description: "Show loading indicator.",
    },
  },
  args: {
    children: "continue",
    variant: "solid",
    size: "md",
    isDisabled: false,
    isLoading: false,
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Solid: Story = {};

/**
 * When `colorScheme: "colorful"`
 */
export const Colorful: Story = {
  args: {
    colorScheme: "colorful",
  },
};

/**
 * When `colorScheme: "translucent"`
 */
export const Translucent: Story = {
  args: {
    colorScheme: "translucent",
  },
};

/**
 * Show loading indicator based on `isLoading` prop.
 */
export const Loading: Story = {
  args: {
    isLoading: true,
  },
};
