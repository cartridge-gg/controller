import type { Meta, StoryObj } from "@storybook/react";
import { ActivityDetail } from ".";
import { CoinsIcon, StarknetColorIcon } from "@/components/icons";

const meta: Meta<typeof ActivityDetail> = {
  title: "Modules/Activities/Detail",
  component: ActivityDetail,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    label: "Label",
    children: <p>Content</p>,
  },
};

export default meta;
type Story = StoryObj<typeof ActivityDetail>;

export const Default: Story = {};

export const Samples: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-3">
      <ActivityDetail label="Contract Address">0xb668...dd65</ActivityDetail>
      <ActivityDetail label="To">0xb668...dd65</ActivityDetail>
      <ActivityDetail label="From">0xb668...dd65</ActivityDetail>
      <ActivityDetail label="Network">
        <div className="flex gap-1.5 items-center">
          <StarknetColorIcon size="sm" />
          Starknet
        </div>
      </ActivityDetail>
      <ActivityDetail label="Network Fee">
        <div className="flex gap-1.5 items-center">
          <CoinsIcon variant="line" size="sm" />
          .01 CREDITS
        </div>
      </ActivityDetail>
      <ActivityDetail label="Token ID">8</ActivityDetail>
      <ActivityDetail label="Token Standard">ERC-721</ActivityDetail>
      <ActivityDetail label="Date">Feb 11th, 2025 at 11:09 pm</ActivityDetail>
      <ActivityDetail label="Status" status="success">
        Succeeded
      </ActivityDetail>
    </div>
  ),
};
