import type { Meta, StoryObj } from "@storybook/react";

import { DeployController } from "./DeployController";
import { constants, num } from "starknet";
import { JsControllerError } from "@cartridge/account-wasm/controller";
import { useConnection, createMockConnection } from "#hooks/connection.mock";

const meta = {
  component: DeployController,
  beforeEach: () => {
    useConnection.mockReturnValue(
      createMockConnection({
        controller: {
          chainId: () => constants.StarknetChainId.SN_SEPOLIA as string,
          callContract: () =>
            Promise.resolve([num.toHex("2000000000000000000"), "0x0"]),
          username: () => "test-account",
          address: () =>
            "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
      }),
    );
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
