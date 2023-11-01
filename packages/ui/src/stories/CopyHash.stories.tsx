import { CopyHash } from "../components";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof CopyHash> = {
  title: "CopyHash",
  component: CopyHash,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof CopyHash>;

export const Default: Story = {
  args: {
    hash: "0x0000000000000000000000000000000000000000",
  },
};

export const Small: Story = {
  args: {
    hash: "0x0000000000000000000000000000000000000000",
    fontSize: "sm",
  },
};
