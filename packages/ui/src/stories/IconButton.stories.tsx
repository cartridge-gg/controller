import { IconButton } from "@chakra-ui/react";
import { Meta, StoryObj } from "@storybook/react";
import { ArrowLeftIcon, TwitterIcon } from "../components/icons";

/**
 *
 */
const meta: Meta<typeof IconButton> = {
  title: "Icon Button",
  component: IconButton,
  tags: ["autodocs"],
  argTypes: {
    icon: {
      control: "object",
    },
  },
};

export default meta;

type Story = StoryObj<typeof IconButton>;

export const Square: Story = {
  args: {
    icon: <ArrowLeftIcon />,
    fontSize: "2xl",
  },
};

export const Brand: Story = {
  args: {
    icon: <TwitterIcon />,
    fontSize: "2xl",
    px: 4,
    py: 2,
  },
};

export const BrandRound: Story = {
  args: {
    variant: "round",
    icon: <TwitterIcon />,
    fontSize: "2xl",
    px: 4,
    py: 2,
  },
};

export const Circle: Story = {
  args: {
    variant: "round",
    icon: <ArrowLeftIcon />,
    fontSize: "2xl",
  },
};
