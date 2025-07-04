import type { Meta, StoryObj } from "@storybook/react";

import { SendToken } from "./index";

const meta = {
  component: SendToken,
} satisfies Meta<typeof SendToken>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
