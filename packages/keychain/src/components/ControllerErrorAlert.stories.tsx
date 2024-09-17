import type { Meta, StoryObj } from "@storybook/react";

import { ControllerErrorAlert } from "./ErrorAlert";
import { ErrorCode } from "@cartridge/account-wasm";

const meta = {
  component: ControllerErrorAlert,
  tags: ["autodocs"],
} satisfies Meta<typeof ControllerErrorAlert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SignError: Story = {
  args: {
    error: {
      code: ErrorCode.SignError,
      message: "blah blah blah...",
    },
  },
};

export const CartridgeControllerNotDeployed: Story = {
  args: {
    error: {
      code: ErrorCode.CartridgeControllerNotDeployed,
      message: "blah blah blah...",
    },
  },
};

export const StarknetTransactionExecutionError: Story = {
  args: {
    error: {
      code: ErrorCode.StarknetTransactionExecutionError,
      message: "Transaction Execution error",
      data: {
        execution_error:
          "Transaction reverted: Transaction execution has failed:\n0: Error in the called contract (contract address: 0x057156ef71dcfb930a272923dcbdc54392b6676497fdc143042ee1d4a7a861c1, class hash: 0x00e2eb8f5672af4e6a4e8a8f1b44989685e668489b0a25437733756c5a34a1d6, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nError at pc=0:4302:\nCairo traceback (most recent call last):\nUnknown location (pc=0:290)\nUnknown location (pc=0:3037)\n\n1: Error in the called contract (contract address: 0x02c2c319b7e3d63afe863f003258b7e2ab3a6ccf5727914e619ad905ce5f8080, class hash: 0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab, selector: 0x034cc13b274446654ca3233ed2c1620d4c5d1d32fd20b47146a3371064bdc57d):\nError at pc=0:14785:\nCairo traceback (most recent call last):\nUnknown location (pc=0:3273)\nUnknown location (pc=0:12490)\n\n2: Error in the called contract (contract address: 0x02c2c319b7e3d63afe863f003258b7e2ab3a6ccf5727914e619ad905ce5f8080, class hash: 0x024a9edbfa7082accfceabf6a92d7160086f346d622f28741bf1c651c412c9ab, selector: 0x013f6fcb09682fd385a29ed9e333d48be50ed8245d540ecd221d510555344456):\nExecution failed. Failure reason: 0x73657373696f6e2f616c72656164792d72656769737465726564 ('session/already-registered').\n",
      },
    },
  },
};

export const StarknetValidationFailure: Story = {
  args: {
    error: {
      code: ErrorCode.StarknetValidationFailure,
      message: "Account validation failed",
      data: {
        execution_error:
          "Max fee (308264936364000) exceeds balance (7443707172597).",
      },
    },
  },
};
