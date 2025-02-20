import { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/primitives/button";
import { ArrowToLineIcon, CoinsIcon, GiftIcon } from "@/components";

const meta: Meta<typeof Button> = {
  title: "Primitives/Button",
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
    children: "sign up",
  },
};

export const DefaultLoading: Story = {
  args: {
    children: "sign up",
    isLoading: true,
  },
};

export const DefaultDisabled: Story = {
  args: {
    children: "sign up",
    disabled: true,
  },
};

export const DefaultWithIcon: Story = {
  args: {
    children: (
      <>
        <CoinsIcon variant="solid" size="sm" /> sign up
      </>
    ),
  },
};

export const DefaultWithIconDisabled: Story = {
  args: {
    children: (
      <>
        <CoinsIcon variant="solid" size="sm" /> sign up
      </>
    ),
    disabled: true,
  },
};

export const Secondary: Story = {
  args: {
    children: "skip",
    variant: "secondary",
  },
};

export const SecondaryLoading: Story = {
  args: {
    children: "skip",
    variant: "secondary",
    isLoading: true,
  },
};

export const SecondaryDisabled: Story = {
  args: {
    children: "skip",
    disabled: true,
    variant: "secondary",
  },
};

export const SecondaryWithIcon: Story = {
  args: {
    children: (
      <>
        <CoinsIcon variant="solid" size="sm" /> skip
      </>
    ),
    variant: "secondary",
  },
};

export const SecondaryWithIconDisabled: Story = {
  args: {
    children: (
      <>
        <CoinsIcon variant="solid" size="sm" /> skip
      </>
    ),
    disabled: true,
    variant: "secondary",
  },
};

export const Tertiary: Story = {
  args: {
    children: "$1",
    variant: "tertiary",
  },
};

export const TertiaryLoading: Story = {
  args: {
    children: "$1",
    variant: "tertiary",
    isLoading: true,
  },
};

export const TertiaryActive: Story = {
  args: {
    children: "$1",
    variant: "tertiary",
    isActive: true,
  },
};

export const IconDeposit: Story = {
  args: {
    children: <ArrowToLineIcon variant="down" />,
    size: "icon",
    variant: "icon",
  },
};

export const IconToggle: Story = {
  args: {
    children: <GiftIcon variant="line" />,
    size: "icon",
    variant: "icon",
  },
};

export const ThumnailDeposit: Story = {
  args: {
    children: <ArrowToLineIcon variant="down" />,
    size: "thumbnail",
    variant: "icon",
  },
};

export const ThumnailToggle: Story = {
  args: {
    children: <GiftIcon variant="line" />,
    size: "thumbnail",
    variant: "icon",
  },
};

export const ExternalLink: Story = {
  args: {
    children: "View on Starkscan",
    variant: "link",
  },
};
