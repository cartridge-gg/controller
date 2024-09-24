import type { Meta, StoryObj } from "@storybook/react";

import { CopyAddress } from "./copy-address";

const meta = {
  component: CopyAddress,
  tags: ["autodocs"],
} satisfies Meta<typeof CopyAddress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    address:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
  },
};
