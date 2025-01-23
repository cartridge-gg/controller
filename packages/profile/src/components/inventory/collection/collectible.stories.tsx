import type { Meta, StoryObj } from "@storybook/react";

import { Collectible } from "./collectible";

const meta = {
  component: Collectible,
} satisfies Meta<typeof Collectible>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
