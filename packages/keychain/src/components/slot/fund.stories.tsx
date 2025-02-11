import type { Meta, StoryObj } from "@storybook/react";

import { Fund } from "./fund";
import { num } from "starknet";

const meta: Meta<typeof Fund> = {
  component: Fund,
  decorators: [(Story) => <Story />],
  parameters: {
    connection: {
      controller: {
        callContract: () =>
          Promise.resolve([num.toHex("2000000000000000000"), "0x0"]),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
