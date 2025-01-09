import type { Meta, StoryObj } from "@storybook/react";

import { Settings } from "./index";

const meta = {
  component: Settings,
} satisfies Meta<typeof Settings>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
