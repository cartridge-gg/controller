import type { Meta, StoryObj } from "@storybook/react";
import { ExecutionContainer } from "./ExecutionContainer";
import { constants } from "starknet";
import { ErrorCode } from "@cartridge/controller-wasm/controller";
import type { Call, FeeEstimate } from "starknet";
import type { ControllerError } from "@/utils/connection";

// Mock controller for useConnection hook
const mockController = {
  chainId: () => constants.StarknetChainId.SN_SEPOLIA as string,
  estimateInvokeFee: async (): Promise<FeeEstimate> => {
    // Simulate fee estimation delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      l1_gas_consumed: "0x1",
      l1_gas_price: "0x1",
      l2_gas_consumed: "0x1",
      l2_gas_price: "0x1",
      l1_data_gas_consumed: "0x0",
      l1_data_gas_price: "0x0",
      overall_fee: "0xde0b6b3a7640000",
      unit: "WEI",
    };
  },
  username: () => "test-account",
  address: () =>
    "0x0000000000000000000000000000000000000000000000000000000000000000",
};

// Mock transactions
const mockTransactions: Call[] = [
  {
    contractAddress:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c7b7f8c8c8c8c8c8c8c8c",
    entrypoint: "transfer",
    calldata: [
      "0x1234567890abcdef1234567890abcdef12345678", // recipient
      "0x1", // amount low
      "0x0", // amount high
    ],
  },
];

// Mock fee estimate
const mockFeeEstimate: FeeEstimate = {
  l1_gas_consumed: "0x1",
  l1_gas_price: "0x1",
  l2_gas_consumed: "0x1",
  l2_gas_price: "0x1",
  l1_data_gas_consumed: "0x0",
  l1_data_gas_price: "0x0",
  overall_fee: "0xde0b6b3a7640000",
  unit: "WEI",
};

// Mock error objects
const mockControllerNotDeployedError: ControllerError = {
  code: ErrorCode.CartridgeControllerNotDeployed,
  message: "Controller not deployed",
  data: {
    fee_estimate: mockFeeEstimate,
  },
};

const mockInsufficientBalanceError: ControllerError = {
  code: ErrorCode.InsufficientBalance,
  message: "Insufficient balance",
  data: {
    fee_estimate: mockFeeEstimate,
  },
};

const mockValidationFailureError: ControllerError = {
  code: ErrorCode.StarknetValidationFailure,
  message: "Validation failed",
  data: "Transaction exceeds balance",
};

const mockSessionAlreadyRegisteredError: ControllerError = {
  code: ErrorCode.SessionAlreadyRegistered,
  message: "Session already registered",
  data: {},
};

const meta = {
  component: ExecutionContainer,
  parameters: {
    connection: {
      controller: mockController,
    },
  },
  args: {
    title: "Execute Transaction",
    description: "Review and confirm your transaction details",
    transactions: mockTransactions,
    onSubmit: async (maxFee?: FeeEstimate) => {
      console.log("Transaction submitted with fee:", maxFee);
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
    onDeploy: () => {
      console.log("Deploy controller requested");
    },
    onError: (error: ControllerError) => {
      console.log("Error occurred:", error);
    },
    buttonText: "SUBMIT",
    children: (
      <div className="p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Transaction Details</h3>
        <p className="text-sm text-gray-600">Transfer 1 ETH to 0x1234...5678</p>
      </div>
    ),
  },
} satisfies Meta<typeof ExecutionContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCustomButtonText: Story = {
  args: {
    buttonText: "CONFIRM TRANSACTION",
  },
};

export const WithRightElement: Story = {
  args: {
    right: (
      <button className="text-blue-500 hover:text-blue-700">Settings</button>
    ),
  },
};

export const ControllerNotDeployed: Story = {
  args: {
    executionError: mockControllerNotDeployedError,
  },
};

export const InsufficientBalance: Story = {
  args: {
    executionError: mockInsufficientBalanceError,
  },
};

export const ValidationFailure: Story = {
  args: {
    executionError: mockValidationFailureError,
  },
};

export const SessionAlreadyRegistered: Story = {
  args: {
    executionError: mockSessionAlreadyRegisteredError,
  },
};

export const UpgradeMode: Story = {
  args: {
    buttonText: "UPGRADE",
    title: "Upgrade Account",
    description: "Upgrade your account to the latest version",
  },
};

export const NoTransactions: Story = {
  args: {
    transactions: [],
    children: (
      <div className="p-4 bg-yellow-100 rounded-lg">
        <p className="text-yellow-800">No transactions to execute</p>
      </div>
    ),
  },
};

export const MultipleTransactions: Story = {
  args: {
    transactions: [
      ...mockTransactions,
      {
        contractAddress:
          "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c7b7f8c8c8c8c8c8c8c8c",
        entrypoint: "approve",
        calldata: [
          "0x1234567890abcdef1234567890abcdef12345678", // spender
          "0x2", // amount low
          "0x0", // amount high
        ],
      },
    ],
    children: (
      <div className="p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Multiple Transactions</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>1. Transfer 1 ETH to 0x1234...5678</li>
          <li>2. Approve 2 ETH for 0x1234...5678</li>
        </ul>
      </div>
    ),
  },
};
