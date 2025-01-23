import type { Meta, StoryObj } from "@storybook/react";

import { SendCollection } from "./index";

const meta = {
  component: SendCollection,
} satisfies Meta<typeof SendCollection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
