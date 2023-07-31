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
      options: ["form-colorful", "form-solid"],
    },
    isDisabled: {
      control: "boolean",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const FormColorful: Story = {
  args: {
    children: "continue",
    variant: "form-colorful",
  },
};

export const FormSolid: Story = {
  args: {
    children: "continue",
    variant: "form-solid",
  },
};
