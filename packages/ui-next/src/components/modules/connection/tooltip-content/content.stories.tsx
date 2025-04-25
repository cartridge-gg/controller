import type { Meta, StoryObj } from "@storybook/react";
import { ConnectionTooltipContent } from "./content";
import { fn } from "@storybook/test";
import { constants } from "starknet";

const meta: Meta<typeof ConnectionTooltipContent> = {
  title: "Modules/Connection/Tooltip Content",
  component: ConnectionTooltipContent,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    username: "shinobi",
    address: "0x1234567890123456789012345678901234567890",
    chainId: constants.StarknetChainId.SN_MAIN,
    followers: 32,
    followings: 32,
    onFollowersClick: fn(),
    onFollowingsClick: fn(),
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ConnectionTooltipContent>;

export const Default: Story = {};

export const HiddenNetwork: Story = {
  args: {
    hideNetwork: true,
  },
};

export const HiddenFollowers: Story = {
  args: {
    followers: undefined,
    followings: undefined,
  },
};
