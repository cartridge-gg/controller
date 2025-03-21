import type { Meta, StoryObj } from "@storybook/react";
import { CollectibleProperty } from "./property";

const meta: Meta<typeof CollectibleProperty> = {
  title: "Modules/Collectibles/Property",
  component: CollectibleProperty,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    name: "Name",
    value: "Bibliomancer",
  },
};

export default meta;
type Story = StoryObj<typeof CollectibleProperty>;

export const Default: Story = {};
