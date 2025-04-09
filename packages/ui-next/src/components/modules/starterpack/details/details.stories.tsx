import type { Meta, StoryObj } from "@storybook/react";
import {
  StarterpackDetails,
  StarterpackDetailsProps,
  StarterpackStatus,
} from "./details";

const meta = {
  title: "Modules/Starterpack/Details",
  component: StarterpackDetails,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  // argTypes: {
  //   items: {
  //     description: "Array of claimable items",
  //     control: { type: "object" },
  //   },
  // },
} satisfies Meta<typeof StarterpackDetails>;

export default meta;
type Story = StoryObj<typeof StarterpackDetails>;

const props: StarterpackDetailsProps = {
  status: StarterpackStatus.CLAIMABLE,
  createdBy: "John Doe",
  owner: "0x1234567890abcdef1234567890abcdef12345678",
  claimedOn: new Date("2023-05-15T14:30:00Z"),
};

export const Default: Story = {
  args: props,
};

export const Claimed: Story = {
  args: { ...props, status: StarterpackStatus.CLAIMED },
};
