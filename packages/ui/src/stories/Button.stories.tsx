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
      description: "Color scheme",
      options: ["colorful", "translucent", "white"],
    },
    size: {
      control: "select",
      description: "Select size",
      options: ["sm", "md", "lg"],
    },
    isDisabled: {
      control: "boolean",
    },
    isLoading: {
      control: "boolean",
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

export const Colorful: Story = {
  args: {
    colorScheme: "colorful",
  },
};

export const Translucent: Story = {
  args: {
    colorScheme: "translucent",
  },
};

export const White: Story = {
  args: {
    colorScheme: "white",
  },
};
