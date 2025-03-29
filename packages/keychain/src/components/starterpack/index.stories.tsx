import type { Meta, StoryObj } from "@storybook/react";

import { StarterPack } from ".";

const meta = {
  component: StarterPack,
} satisfies Meta<typeof StarterPack>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
