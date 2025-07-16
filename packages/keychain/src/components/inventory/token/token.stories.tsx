import type { Meta, StoryObj } from "@storybook/react";

import { Token } from "./token";

const meta = {
  component: Token,
} satisfies Meta<typeof Token>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
