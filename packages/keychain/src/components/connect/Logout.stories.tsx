import type { Meta, StoryObj } from "@storybook/react";

import { Logout } from "./Logout";

const meta = {
  component: Logout,
} satisfies Meta<typeof Logout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
