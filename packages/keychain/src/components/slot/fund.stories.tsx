import type { Meta, StoryObj } from "@storybook/react";

import { Fund } from "./fund";
import { constants, num, RpcProvider } from "starknet";

const meta: Meta<typeof Fund> = {
  component: Fund,
  decorators: [(Story) => <Story />],
  parameters: {
    connection: {
      controller: {
        chainId: () => constants.StarknetChainId.SN_SEPOLIA as string,
        callContract: () =>
          Promise.resolve([num.toHex("2000000000000000000"), "0x0"]),
        rpc: new RpcProvider({ nodeUrl: "https://api.cartridge/x/sepolia" }),
        username: () => "test-account",
        address:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
