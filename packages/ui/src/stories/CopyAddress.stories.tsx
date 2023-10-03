import { CopyAddress } from "../components";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof CopyAddress> = {
  title: "CopyAddress",
  component: CopyAddress,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof CopyAddress>;

export const Default: Story = {
  args: { address: "0x0000000000000000000000000000000000000000" },
};
