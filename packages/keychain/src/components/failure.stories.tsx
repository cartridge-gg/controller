import type { Meta, StoryObj } from "@storybook/react";

import { Failure } from "./failure";

const meta = {
  component: Failure,
} satisfies Meta<typeof Failure>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
