import type { Meta, StoryObj } from "@storybook/react";

import { Signup } from "./Signup";

const meta = {
  component: Signup,
} satisfies Meta<typeof Signup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onLogin: () => {},
  },
};
