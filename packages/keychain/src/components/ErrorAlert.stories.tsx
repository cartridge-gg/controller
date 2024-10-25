import type { Meta, StoryObj } from "@storybook/react";

import { ErrorAlert } from "./ErrorAlert";

const title = "Something went wrong";
const description =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eu dolor vehicula, ullamcorper arcu vitae, vestibulum turpis. Aliquam mattis, sem a euismod tincidunt, neque quam consequat nulla, vitae feugiat urna justo eu dolor. ";

const meta = {
  component: ErrorAlert,
  tags: ["autodocs"],
  args: {
    title,
    description,
    copyText: description,
    isExpanded: true,
  },
} satisfies Meta<typeof ErrorAlert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
  },
};

export const Error: Story = {
  args: {
    variant: "error",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
  },
};

export const Info: Story = {
  args: {
    variant: "info",
  },
};

export const LongTitle: Story = {
  args: {
    title:
      "Long text should align left and blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah.",
  },
};
