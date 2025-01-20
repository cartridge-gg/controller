import type { Meta, StoryObj } from "@storybook/react";

import { Success } from "./success";

const meta = {
  component: Success,
} satisfies Meta<typeof Success>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
