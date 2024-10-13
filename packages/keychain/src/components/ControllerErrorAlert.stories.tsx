import type { Meta, StoryObj } from "@storybook/react";
import { ControllerErrorAlert as CtrlErrAlert } from "./ErrorAlert";
import { VStack } from "@chakra-ui/react";
import { ErrorCode } from "@cartridge/account-wasm/controller";
import { starknetTransactionExecutionErrorTestCases } from "utils/errors";

const meta = {
  component: ControllerErrorAlert,
  tags: ["autodocs"],
} satisfies Meta<typeof ControllerErrorAlert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const All: Story = {};

function ControllerErrorAlert() {
  return (
    <VStack>
      <CtrlErrAlert
        error={{ code: ErrorCode.SignError, message: "blah blah blah..." }}
      />
      <CtrlErrAlert
        error={{
          code: ErrorCode.CartridgeControllerNotDeployed,
          message: "blah blah blah...",
        }}
      />

      {starknetTransactionExecutionErrorTestCases.map(({ input }, i) => (
        <CtrlErrAlert
          key={i}
          error={{
            code: ErrorCode.StarknetTransactionExecutionError,
            ...input,
          }}
        />
      ))}
    </VStack>
  );
}
