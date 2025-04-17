import type { Meta, StoryObj } from "@storybook/react";
import { Purchase, PurchaseState } from ".";
import { WalletsProvider } from "@/hooks/wallets";
import { PurchaseType } from "@/hooks/payments/crypto";

const meta = {
  component: Purchase,
} satisfies Meta<typeof Purchase>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PurchaseCredits: Story = {
  args: {
    type: PurchaseType.CREDITS,
    wallets: [
      {
        type: "phantom",
        platform: "solana",
        available: true,
      },
    ],
  },

  decorators: [
    (Story) => (
      <WalletsProvider>
        <Story />
      </WalletsProvider>
    ),
  ],
};

export const Success: Story = {
  args: {
    type: PurchaseType.CREDITS,
    wallets: [],
    initState: PurchaseState.SUCCESS,
  },

  decorators: [
    (Story) => (
      <WalletsProvider>
        <Story />
      </WalletsProvider>
    ),
  ],
};
