import type { Meta, StoryObj } from "@storybook/react";
import { SpendingLimitCard } from "./SpendingLimitCard";
import { CoinsIcon } from "@cartridge/ui";
import type { ParsedSessionPolicies } from "@/hooks/session";

const meta = {
  title: "components/connect/Spending Limit Card",
  component: SpendingLimitCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    className: "w-80",
  },
} satisfies Meta<typeof SpendingLimitCard>;

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

const mockPoliciesWithUnlimitedAmount: ParsedSessionPolicies = {
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
          amount: "340282366920938463463374607431768211455", // MAX_UINT128
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

export const LimitedAmount: Story = {
  args: {
    policies: mockPoliciesWithLimitedAmount,
  },
};

export const UnlimitedAmount: Story = {
  args: {
    policies: mockPoliciesWithUnlimitedAmount,
  },
};

export const MultipleTokens: Story = {
  args: {
    policies: mockPoliciesWithMultipleTokens,
  },
};
