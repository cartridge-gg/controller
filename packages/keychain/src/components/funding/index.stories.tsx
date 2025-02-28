import type { Meta, StoryObj } from "@storybook/react";

import { Funding } from ".";
import { num } from "starknet";
import { useConnection, createMockConnection } from "#hooks/connection.mock";

const meta = {
  component: Funding,
  beforeEach: () => {
    useConnection.mockReturnValue(
      createMockConnection({
        controller: {
          callContract: () =>
            Promise.resolve([num.toHex("2000000000000000000"), "0x0"]),
        },
      }),
    );
  },
} satisfies Meta<typeof Funding>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
