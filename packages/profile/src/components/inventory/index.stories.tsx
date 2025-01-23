import type { Meta, StoryObj } from "@storybook/react";

import { Inventory } from ".";

const meta = {
  component: Inventory,
} satisfies Meta<typeof Inventory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
