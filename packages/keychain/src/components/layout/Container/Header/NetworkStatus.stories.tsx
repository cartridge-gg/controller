import type { Meta, StoryObj } from "@storybook/react";

import { NetworkStatus } from "./NetworkStatus";
import { constants } from "starknet";
import { toHex } from "viem";

const meta = {
  component: NetworkStatus,
} satisfies Meta<typeof NetworkStatus>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mainnet: Story = {
  parameters: {
    connection: {
      chainId: constants.StarknetChainId.SN_MAIN as string,
    },
  },
};

export const Sepolia: Story = {};

export const Slot: Story = {
  parameters: {
    connection: {
      chainId: toHex("SN_RYO"),
    },
  },
};
