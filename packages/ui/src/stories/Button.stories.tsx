import { Button } from "@chakra-ui/react";
import { Meta, StoryObj } from "@storybook/react";
import { CopyIcon, JoystickIcon } from "../components/icons";

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
      options: ["solid", "link"],
    },
    colorScheme: {
      control: "select",
      description: "Custom color scheme.",
      options: ["colorful", "translucent"],
    },
    size: {
      control: "select",
      description: "Select size",
      options: ["xs", "sm", "md", "lg"],
    },
    isDisabled: {
      control: "boolean",
      description: "Gray out a button when disabled",
    },
    isLoading: {
      control: "boolean",
      description: "Show loading indicator.",
    },
    leftIcon: {
      control: "object",
    },
    rightIcon: {
      control: "object",
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

export const Round: Story = {
  args: {
    variant: "round",
  },
};

export const HeaderButton: Story = {
  args: {
    children: "0xb5…34a5",
    fontSize: "small",
    variant: "round",
    leftIcon: <JoystickIcon variant="line" />,
    rightIcon: <CopyIcon />,
  },
};

export const LinkButton: Story = {
  args: {
    variant: "link",
    children: "log in",
  },
};
