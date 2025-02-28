import type { Meta, StoryObj } from "@storybook/react";

import { ConfirmTransaction } from "./ConfirmTransaction";
import { ETH_CONTRACT_ADDRESS } from "@cartridge/utils";
import { VerifiableControllerTheme } from "#components/provider/connection";

const meta = {
  component: ConfirmTransaction,
  parameters: {
    connection: {
      controller: {
        estimateInvokeFee: () => ({
          suggestedMaxFee: "100",
        }),
        hasSession: () => true,
        session: () => true,
      },
      context: {
        origin: "http://localhost:6001",
        type: "execute",
        transactions: [
          {
            contractAddress: ETH_CONTRACT_ADDRESS,
            entrypoint: "approve",
            calldata: [
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              "0x0",
              "0x0",
            ],
          },
          {
            contractAddress: ETH_CONTRACT_ADDRESS,
            entrypoint: "transfer",
            calldata: [
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              "0x0",
              "0x0",
            ],
          },
        ],
        onCancel: () => {},
      },
    },
  },
} satisfies Meta<typeof ConfirmTransaction>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTheme: Story = {
  parameters: {
    preset: "eternum",
  },
  args: {
    theme: {
      name: "Eternum",
    } as VerifiableControllerTheme,
    usernameField: {
      value: "",
      error: undefined,
    },
    validation: {
      status: "valid",
      exists: false,
    },
    isLoading: false,
    onUsernameChange: () => {},
    onUsernameFocus: () => {},
    onUsernameClear: () => {},
    onSubmit: () => {},
  },
};
