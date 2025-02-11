import type { Meta, StoryObj } from "@storybook/react";

import { Funding } from ".";
import { num } from "starknet";

const meta = {
  component: Funding,
  parameters: {
    connection: {
      controller: {
        callContract: () =>
          Promise.resolve([num.toHex("2000000000000000000"), "0x0"]),
      },
    },
  },
} satisfies Meta<typeof Funding>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
