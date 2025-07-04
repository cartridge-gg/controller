import type { Meta, StoryObj } from "@storybook/react";

import { CollectionAsset } from "./collection-asset";

const meta = {
  component: CollectionAsset,
} satisfies Meta<typeof CollectionAsset>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
