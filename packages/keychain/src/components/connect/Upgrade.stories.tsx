import type { Meta, StoryObj } from "@storybook/react";
import { Upgrade } from "./Upgrade";

const meta = {
  component: Upgrade,
} satisfies Meta<typeof Upgrade>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
