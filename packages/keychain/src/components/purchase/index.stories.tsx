import type { Meta, StoryObj } from "@storybook/react";
import { Purchase, PurchaseState } from ".";
import { WalletsProvider } from "@/hooks/wallets";
import { PurchaseType } from "@/hooks/payments/crypto";
import { StarterItemType } from "@/hooks/starterpack";

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

export const PurchaseStarterpack: Story = {
  args: {
    type: PurchaseType.STARTERPACK,
    wallets: [
      {
        type: "phantom",
        platform: "solana",
        available: true,
      },
    ],
    starterpackDetails: {
      id: "1",
      priceUsd: 100,
      starterPackItems: [
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
    },
  },

  decorators: [
    (Story) => (
      <WalletsProvider>
        <Story />
      </WalletsProvider>
    ),
  ],
};

export const SuccessCredits: Story = {
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

export const SuccessStarterpack: Story = {
  args: {
    type: PurchaseType.STARTERPACK,
    wallets: [],
    initState: PurchaseState.SUCCESS,
    starterpackDetails: {
      id: "1",
      priceUsd: 100,
      starterPackItems: [
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
    },
  },

  decorators: [
    (Story) => (
      <WalletsProvider>
        <Story />
      </WalletsProvider>
    ),
  ],
};
