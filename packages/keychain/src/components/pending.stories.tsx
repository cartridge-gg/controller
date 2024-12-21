import type { Meta, StoryObj } from "@storybook/react";

import { Pending } from "./pending";

const meta = {
  component: Pending,
} satisfies Meta<typeof Pending>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
