import type { Meta, StoryObj } from "@storybook/react";
import { ControllerErrorAlert as CtrlErrAlert } from "./ErrorAlert";
import { ErrorCode } from "@cartridge/controller-wasm/controller";
import {
  starknetTransactionExecutionErrorTestCases,
  starknetTransactionValidationErrorTestCases,
} from "@/utils/errors";

const meta = {
  component: ControllerErrorAlert,
  tags: ["autodocs"],
} satisfies Meta<typeof ControllerErrorAlert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const All: Story = {};

function ControllerErrorAlert() {
  return (
    <div className="flex flex-col gap-4">
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

      {starknetTransactionValidationErrorTestCases.map(({ input }, i) => (
        <CtrlErrAlert
          key={i}
          error={{
            code: ErrorCode.StarknetValidationFailure,
            ...input,
          }}
        />
      ))}

      <CtrlErrAlert
        error={{
          code: ErrorCode.StarknetTransactionExecutionError,
          data: "Invalid json format",
          message: "",
        }}
      />
      <CtrlErrAlert
        error={{
          code: ErrorCode.StarknetValidationFailure,
          data: "Validation failed",
          message: "",
        }}
      />
      <CtrlErrAlert
        error={{
          code: ErrorCode.StarknetValidationFailure,
          data: "Max fee (200) exceeds balance (100)",
          message: "",
        }}
      />
    </div>
  );
}
