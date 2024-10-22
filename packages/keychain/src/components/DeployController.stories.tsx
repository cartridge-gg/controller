import type { Meta, StoryObj } from "@storybook/react";

import { DeployController } from "./DeployController";
import { constants, num, RpcProvider } from "starknet";
import { JsControllerError } from "@cartridge/account-wasm/controller";

const meta = {
  component: DeployController,
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
} satisfies Meta<typeof DeployController>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onClose: () => {},
    ctrlError: {
      data: {
        fee_estimate: {
          overall_fee: "1000000000000000000",
        },
      },
    } as unknown as JsControllerError,
  },
};
