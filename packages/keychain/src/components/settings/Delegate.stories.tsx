import type { Meta, StoryObj } from "@storybook/react";

import { Delegate } from "./Delegate";

const meta = {
  component: Delegate,
  args: {
    onBack: () => {},
  },
} satisfies Meta<typeof Delegate>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
