import type { Meta, StoryObj } from "@storybook/react";
import { CheckoutState, CryptoCheckout } from "./CryptoCheckout";
import { StarterItemType } from "@/hooks/starterpack";

const meta = {
  component: CryptoCheckout,
} satisfies Meta<typeof CryptoCheckout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PurchaseStarterpack: Story = {
  args: {
    selectedWallet: {
      type: "phantom",
      available: true,
      platform: "solana",
    },
    walletAddress: "0x1234567890123456789012345678901234567890",
    cost: 5,
    starterpackItems: [
      {
        title: "Village",
        collectionName: "Eternum Village",
        description:
          "Villages are the basic building block of eternum, they allow you to produce troops and resources.",
        price: 5,
        image: "https://r2.quddus.my/Frame%203231.png",
        type: StarterItemType.NFT,
      },
      {
        title: "20 Credits",
        description: "Credits cover service fee(s) in Eternum.",
        price: 0,
        image: "/ERC-20-Icon.svg",
        type: StarterItemType.CREDIT,
        value: 50,
      },
    ],
    onBack: () => {},
    onComplete: () => {},
  },
};

export const PurchaseCredits: Story = {
  args: {
    selectedWallet: {
      type: "phantom",
      available: true,
      platform: "solana",
    },
    walletAddress: "0x1234567890123456789012345678901234567890",
    cost: 10,
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
    cost: 10,
    onBack: () => {},
    onComplete: () => {},
    initialState: CheckoutState.REQUESTING_PAYMENT,
  },
};

export const CreditsTxnSubmitted: Story = {
  args: {
    selectedWallet: {
      type: "phantom",
      available: true,
      platform: "solana",
    },
    walletAddress: "0x1234567890123456789012345678901234567890",
    cost: 10,
    onBack: () => {},
    onComplete: () => {},
    initialState: CheckoutState.TRANSACTION_SUBMITTED,
  },
};


export const StarterpackTxnSubmitted: Story = {
  args: {
    selectedWallet: {
      type: "phantom",
      available: true,
      platform: "solana",
    },
    walletAddress: "0x1234567890123456789012345678901234567890",
    cost: 10,
    starterpackItems: [
      {
        title: "Village",
        collectionName: "Eternum Village",
        description:
          "Villages are the basic building block of eternum, they allow you to produce troops and resources.",
        price: 5,
        image: "https://r2.quddus.my/Frame%203231.png",
        type: StarterItemType.NFT,
      },
      {
        title: "20 Credits",
        description: "Credits cover service fee(s) in Eternum.",
        price: 0,
        image: "/ERC-20-Icon.svg",
        type: StarterItemType.CREDIT,
        value: 50,
      },
    ],
    onBack: () => {},
    onComplete: () => {},
    initialState: CheckoutState.TRANSACTION_SUBMITTED,
  },
};
