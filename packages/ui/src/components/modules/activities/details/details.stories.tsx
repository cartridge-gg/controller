import type { Meta, StoryObj } from "@storybook/react";
import { ActivityDetails } from ".";
import { ActivityDetail, Thumbnail } from "@/index";
import { CreditIcon, StarknetColorIcon } from "@/components/icons";

const meta: Meta<typeof ActivityDetails> = {
  title: "Modules/Activities/Details",
  component: ActivityDetails,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    children: <p>Content</p>,
  },
};

export default meta;
type Story = StoryObj<typeof ActivityDetails>;

export const Default: Story = {
  render: () => (
    <ActivityDetails>
      <ActivityDetail label="Date">Feb 11th, 2025 at 11:09 pm</ActivityDetail>
      <ActivityDetail label="Status" status="fail">
        Failed
      </ActivityDetail>
      <ActivityDetail label="To">0xb668...dd65</ActivityDetail>
      <ActivityDetail label="Network">
        <div className="flex gap-1.5 items-center">
          <Thumbnail
            icon={<StarknetColorIcon className="absolute" size="default" />}
            size="xs"
            centered
            rounded
          />
          Starknet
        </div>
      </ActivityDetail>
      <ActivityDetail label="Network Fee">
        <div className="flex gap-1.5 items-center">
          <Thumbnail
            icon={<CreditIcon className="absolute" size="default" />}
            size="xs"
            centered
            rounded
          />
          .01 CREDITS ($0.001)
        </div>
      </ActivityDetail>
    </ActivityDetails>
  ),
};
