import { CopyText } from "../components";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof CopyText> = {
  title: "CopyText",
  component: CopyText,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof CopyText>;

export const Default: Story = {
  args: {
    value: "0x00...0000",
    copyValue: "0x0000000000000000000000000000000000000000",
  },
};
