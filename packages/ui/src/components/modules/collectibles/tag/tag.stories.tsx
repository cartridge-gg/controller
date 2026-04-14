import type { Meta, StoryObj } from "@storybook/react";
import { CollectibleTag } from "./tag";
import { TagIcon } from "@/components/icons";

const meta: Meta<typeof CollectibleTag> = {
  title: "Modules/Collectibles/Tag",
  component: CollectibleTag,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof CollectibleTag>;

export const Default: Story = {
  render: () => (
    <CollectibleTag label="100">
      <TagIcon variant="solid" size="sm" />
    </CollectibleTag>
  ),
};
