import { Heading } from "@chakra-ui/react";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Heading> = {
  title: "Heading",
  component: Heading,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Heading>;

export const Default: Story = {
  args: {
    children: "hash",
    variant: "section",
    as: "span",
  },
};
