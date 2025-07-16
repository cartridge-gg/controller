import type { Meta, StoryObj } from "@storybook/react";

import { SendCollection } from "./collection";

const meta = {
  component: SendCollection,
} satisfies Meta<typeof SendCollection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
