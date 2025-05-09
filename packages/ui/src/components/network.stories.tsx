import type { Meta, StoryObj } from "@storybook/react";

import { Network } from "./network";
import { constants } from "starknet";
import { toHex } from "viem";

const meta = {
  title: "Network",
  component: Network,
  tags: ["autodocs"],
} satisfies Meta<typeof Network>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mainnet: Story = {
  args: {
    chainId: constants.StarknetChainId.SN_MAIN,
  },
};

export const Sepolia: Story = {
  args: {
    chainId: constants.StarknetChainId.SN_SEPOLIA,
  },
};

export const Slot: Story = {
  args: {
    chainId: toHex("WP_RYO"),
  },
};

export const Unknown: Story = {
  args: {
    chainId: toHex("UNKNOWN_CHAIN"),
  },
};
