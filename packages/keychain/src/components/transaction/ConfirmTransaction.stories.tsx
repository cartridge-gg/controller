import type { Meta, StoryObj } from "@storybook/react";

import { ConfirmTransaction } from "./ConfirmTransaction";
import { ETH_CONTRACT_ADDRESS } from "@cartridge/ui/utils";
import { ErrorCode } from "@cartridge/controller-wasm/controller";
import type { ControllerError } from "@/utils/connection";

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
        isRequestedSession: () => Promise.resolve(true),
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

export const Default: Story = {
  args: {
    transactions: [
      {
        contractAddress:
          "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        entrypoint: "transfer",
        calldata: ["0x1234567890abcdef", "1000000000000000000", "0"],
      },
    ],
    onComplete: (transaction_hash: string) => {
      console.log("Transaction completed:", transaction_hash);
    },
  },
};

export const WithTheme: Story = {
  parameters: {
    preset: "eternum",
  },
  args: {
    transactions: [
      {
        contractAddress:
          "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        entrypoint: "transfer",
        calldata: ["0x1234567890abcdef", "1000000000000000000", "0"],
      },
    ],
    onComplete: (transaction_hash: string) => {
      console.log("Transaction completed:", transaction_hash);
    },
  },
};

export const ValidationErrorFromFeeEstimation: Story = {
  parameters: {
    connection: {
      controller: {
        estimateInvokeFee: () => {
          throw {
            code: ErrorCode.StarknetValidationFailure,
            message: "Account validation failed",
            data: "Max L1Gas price (124633042180018) is lower than the actual gas price: 124674778309089.",
          } as ControllerError;
        },
        hasSession: () => true,
        session: () => true,
        isRequestedSession: () => Promise.resolve(true),
      },
      context: {
        origin: "http://localhost:6001",
        type: "execute",
      },
    },
  },
  args: {
    transactions: [
      {
        contractAddress:
          "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        entrypoint: "transfer",
        calldata: ["0x1234567890abcdef", "1000000000000000000", "0"],
      },
    ],
    onComplete: (transaction_hash: string) => {
      console.log("Transaction completed:", transaction_hash);
    },
  },
};

export const ValidationErrorFromProp: Story = {
  parameters: {
    connection: {
      controller: {
        estimateInvokeFee: () =>
          Promise.resolve({
            suggestedMaxFee: BigInt(100),
          }),
        hasSession: () => true,
        session: () => true,
        isRequestedSession: () => Promise.resolve(true),
      },
      context: {
        origin: "http://localhost:6001",
        type: "execute",
      },
    },
  },
  args: {
    transactions: [
      {
        contractAddress:
          "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        entrypoint: "transfer",
        calldata: ["0x1234567890abcdef", "1000000000000000000", "0"],
      },
    ],
    executionError: {
      code: ErrorCode.StarknetValidationFailure,
      message: "Account validation failed",
      data: "Max L1Gas price (124633042180018) is lower than the actual gas price: 124674778309089.",
    } as ControllerError,
    onComplete: (transaction_hash: string) => {
      console.log("Transaction completed:", transaction_hash);
    },
  },
};
