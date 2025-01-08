import type { Meta, StoryObj } from "@storybook/react";

import { Recovery } from "./Recovery";

const meta = {
  component: Recovery,
  args: {
    onBack: () => {},
  },
} satisfies Meta<typeof Recovery>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
