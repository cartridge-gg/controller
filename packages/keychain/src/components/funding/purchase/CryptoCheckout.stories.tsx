import type { Meta, StoryObj } from "@storybook/react";
import { CheckoutState, CryptoCheckout } from "./CryptoCheckout";

const meta = {
  component: CryptoCheckout,
} satisfies Meta<typeof CryptoCheckout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PurchaseWithPhantom: Story = {
  args: {
    selectedWallet: {
      type: "phantom",
      available: true,
      platform: "solana",
    },
    walletAddress: "0x1234567890123456789012345678901234567890",
    creditsAmount: 10,
    onBack: () => {},
    onComplete: () => {},
  },
};

export const PurchaseWithArgent: Story = {
  args: {
    selectedWallet: {
      type: "argent",
      available: true,
      platform: "solana",
    },
    walletAddress: "0x1234567890123456789012345678901234567890",
    creditsAmount: 10,
    onBack: () => {},
    onComplete: () => {},
  },
};

export const PurchaseWithMetaMask: Story = {
  args: {
    selectedWallet: {
      type: "metamask",
      available: true,
      platform: "solana",
    },
    walletAddress: "0x1234567890123456789012345678901234567890",
    creditsAmount: 10,
    onBack: () => {},
    onComplete: () => {},
  },
};

export const RequestingPayment: Story = {
  args: {
    selectedWallet: {
      type: "phantom",
      available: true,
      platform: "solana",
    },
    walletAddress: "0x1234567890123456789012345678901234567890",
    creditsAmount: 10,
    onBack: () => {},
    onComplete: () => {},
    initialState: CheckoutState.REQUESTING_PAYMENT,
  },
};

export const TransactionSubmitted: Story = {
  args: {
    selectedWallet: {
      type: "phantom",
      available: true,
      platform: "solana",
    },
    walletAddress: "0x1234567890123456789012345678901234567890",
    creditsAmount: 10,
    onBack: () => {},
    onComplete: () => {},
    initialState: CheckoutState.TRANSACTION_SUBMITTED,
  },
};
