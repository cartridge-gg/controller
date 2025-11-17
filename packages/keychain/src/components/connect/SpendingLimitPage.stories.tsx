import type { Meta, StoryObj } from "@storybook/react";
import { SpendingLimitPage } from "./SpendingLimitPage";
import { CoinsIcon } from "@cartridge/ui";
import type { ParsedSessionPolicies } from "@/hooks/session";
import type { ControllerError } from "@/utils/connection";
import { ErrorCode } from "@cartridge/controller-wasm/controller";

const meta = {
  component: SpendingLimitPage,
  parameters: {
    connection: {
      origin: "https://cartridge.gg",
      theme: {
        name: "Cartridge",
        icon: "/cartridge-icon.svg",
      },
    },
  },
} satisfies Meta<typeof SpendingLimitPage>;

export default meta;

type Story = StoryObj<typeof meta>;

const mockPoliciesWithLimitedAmount: ParsedSessionPolicies = {
  verified: true,
  contracts: {
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7": {
      name: "ETH",
      meta: {
        type: "ERC20",
        name: "Ethereum",
        icon: <CoinsIcon variant="line" />,
      },
      methods: [
        {
          entrypoint: "approve",
          amount: "0x1", // 1 ETH
        },
      ],
    },
  },
};

const mockPoliciesWithMultipleTokens: ParsedSessionPolicies = {
  verified: true,
  contracts: {
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7": {
      name: "ETH",
      meta: {
        type: "ERC20",
        name: "Ethereum",
        icon: <CoinsIcon variant="line" />,
      },
      methods: [
        {
          entrypoint: "approve",
          amount: "0x1", // 1 ETH
        },
      ],
    },
    "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8": {
      name: "USDC",
      meta: {
        type: "ERC20",
        name: "USD Coin",
        icon: <CoinsIcon variant="line" />,
      },
      methods: [
        {
          entrypoint: "approve",
          amount: "0x3", // 3 USDC
        },
      ],
    },
    "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d": {
      name: "STRK",
      meta: {
        type: "ERC20",
        name: "Starknet Token",
        icon: <CoinsIcon variant="line" />,
      },
      methods: [
        {
          entrypoint: "approve",
          amount: "340282366920938463463374607431768211455", // Unlimited
        },
      ],
    },
  },
};

export const Default: Story = {
  args: {
    policies: mockPoliciesWithLimitedAmount,
    isConnecting: false,
    onBack: () => console.log("Back clicked"),
    onConnect: () => console.log("Connect clicked"),
  },
};

export const MultipleTokens: Story = {
  args: {
    policies: mockPoliciesWithMultipleTokens,
    isConnecting: false,
    onBack: () => console.log("Back clicked"),
    onConnect: () => console.log("Connect clicked"),
  },
};

export const Connecting: Story = {
  args: {
    policies: mockPoliciesWithLimitedAmount,
    isConnecting: true,
    onBack: () => console.log("Back clicked"),
    onConnect: () => console.log("Connect clicked"),
  },
};

export const WithError: Story = {
  args: {
    policies: mockPoliciesWithLimitedAmount,
    isConnecting: false,
    error: {
      code: ErrorCode.SignError,
      message: "Failed to connect to the application",
    } as ControllerError,
    onBack: () => console.log("Back clicked"),
    onConnect: () => console.log("Connect clicked"),
  },
};

export const CustomTheme: Story = {
  parameters: {
    connection: {
      origin: "https://example-game.com",
      theme: {
        name: "Example Game",
        icon: "/game-icon.svg",
      },
    },
  },
  args: {
    policies: mockPoliciesWithMultipleTokens,
    isConnecting: false,
    onBack: () => console.log("Back clicked"),
    onConnect: () => console.log("Connect clicked"),
  },
};
