import type { Meta, StoryObj } from "@storybook/react";

import { DeployControllerView } from "./DeployController";
import { constants, num } from "starknet";
import { JsControllerError } from "@cartridge/controller-wasm/controller";
import Controller from "@/utils/controller";

const meta = {
  component: DeployControllerView,
  parameters: {
    connection: {
      controller: {
        chainId: () => constants.StarknetChainId.SN_SEPOLIA as string,
        callContract: () =>
          Promise.resolve([num.toHex("2000000000000000000"), "0x0"]),
        username: () => "test-account",
        address: () =>
          "0x0000000000000000000000000000000000000000000000000000000000000000",
      } as Partial<Controller>,
    },
  },
} satisfies Meta<typeof DeployControllerView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onCancel: () => {},
    onComplete: (hash: string) => console.log("Deploy completed:", hash),
    ctrlError: {
      data: {
        fee_estimate: {
          gas_consumed: "0x1",
          gas_price: "0x1",
          overall_fee: "0xde0b6b3a7640000",
          unit: "WEI",
          data_gas_consumed: "0x0",
          data_gas_price: "0x0",
        },
      },
    } as unknown as JsControllerError,
  },
};
