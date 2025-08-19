import type { Meta, StoryObj } from "@storybook/react";
import { Purchase, PurchaseState } from ".";
import { WalletsProvider } from "@/hooks/wallets";
import { PurchaseType } from "@/hooks/payments/crypto";
import { AcquisitionType, StarterItemType } from "@/hooks/starterpack";

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

export const FreeStarterpack: Story = {
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
      name: "Booster Pack",
      priceUsd: 0,
      acquisitionType: AcquisitionType.PAID,
      mintAllowance: {
        count: 0,
        limit: 1,
      },
      starterPackItems: [
        {
          title: "Booster Pack",
          collectionName: "Chaos Surfers",
          description: "Contains random playable agents",
          price: 0,
          image:
            "https://storage.googleapis.com/c7e-prod-static/media/chaos.png",
          type: StarterItemType.NFT,
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

export const FreeStarterpackLimitReached: Story = {
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
      name: "Booster Pack",
      priceUsd: 0,
      acquisitionType: AcquisitionType.PAID,
      mintAllowance: {
        count: 1,
        limit: 1,
      },
      starterPackItems: [
        {
          title: "Booster Pack",
          collectionName: "Chaos Surfers",
          description: "Contains random playable agents",
          price: 0,
          image:
            "https://storage.googleapis.com/c7e-prod-static/media/chaos.png",
          type: StarterItemType.NFT,
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
      name: "Starter Pack Name",
      priceUsd: 100,
      acquisitionType: AcquisitionType.PAID,
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

export const PurchaseStarterpackWithSupply: Story = {
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
      name: "Starter Pack Name",
      priceUsd: 100,
      supply: 87,
      acquisitionType: AcquisitionType.PAID,
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

export const PurchaseStarterpackSoldOut: Story = {
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
      name: "Starter Pack Name",
      priceUsd: 100,
      supply: 0,
      acquisitionType: AcquisitionType.PAID,
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
      name: "Starter Pack Name",
      priceUsd: 100,
      acquisitionType: AcquisitionType.PAID,
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
