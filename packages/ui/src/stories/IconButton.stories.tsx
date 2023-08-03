import { IconButton } from "@chakra-ui/react";
import { Meta, StoryObj } from "@storybook/react";
import { ArrowLeftIcon, TwitterIcon } from "../components/icons";
import theme from "../theme";

/**
 *
 */
const meta: Meta<typeof IconButton> = {
  title: "Icon Button",
  component: IconButton,
  tags: ["autodocs"],
  argTypes: {
    icon: {
      control: "select",
      options: ["Twitter", "ArrowLeft"],
      mapping: {
        Twitter: <TwitterIcon />,
        ArrowLeft: <ArrowLeftIcon />,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof IconButton>;

export const Square: Story = {
  args: {
    icon: "ArrowLeft",
    fontSize: "2xl",
  },
};

export const Brand: Story = {
  args: {
    icon: "Twitter",
    fontSize: "2xl",
    px: 4,
    py: 2,
  },
};

export const BrandRound: Story = {
  args: {
    variant: "round",
    icon: "Twitter",
    fontSize: "2xl",
    px: 4,
    py: 2,
  },
};

export const Circle: Story = {
  args: {
    variant: "round",
    icon: "ArrowLeft",
    fontSize: "2xl",
  },
};
