import type { Meta, StoryObj } from "@storybook/react";

import { Inventory } from "./index";

const meta = {
  component: Inventory,
} satisfies Meta<typeof Inventory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
