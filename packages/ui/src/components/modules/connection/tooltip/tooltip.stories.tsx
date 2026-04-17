import type { Meta, StoryObj } from "@storybook/react";
import { ConnectionTooltip } from "./tooltip";
import { fn } from "@storybook/test";
import { constants } from "starknet";

const meta: Meta<typeof ConnectionTooltip> = {
  title: "Modules/Connection/Tooltip Trigger",
  component: ConnectionTooltip,
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
    hideUsername: false,
    hideNetwork: false,
    onFollowersClick: fn(),
    onFollowingsClick: fn(),
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ConnectionTooltip>;

export const Default: Story = {};

export const HiddenUsername: Story = {
  args: {
    hideUsername: true,
  },
};

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

export const DisabledFollowers: Story = {
  args: {
    onFollowersClick: undefined,
    onFollowingsClick: undefined,
  },
};
