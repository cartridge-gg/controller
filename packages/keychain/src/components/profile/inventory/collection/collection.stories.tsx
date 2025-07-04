import type { Meta, StoryObj } from "@storybook/react";

import { Collection } from "./collection";

const meta = {
  component: Collection,
} satisfies Meta<typeof Collection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
