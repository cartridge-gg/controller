import type { Meta, StoryObj } from "@storybook/react";

import { CreateSession } from "./CreateSession";

const meta = {
  component: CreateSession,
  parameters: {
    upgrade: {
      isSynced: true,
    },
  },
} satisfies Meta<typeof CreateSession>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onConnect: () => {},
  },
};
