import type { Meta, StoryObj } from "@storybook/react";
import { ReviewPurchase } from "./review";
import { StarterItemType } from "@/hooks/starterpack";

const meta = {
  component: ReviewPurchase,
} satisfies Meta<typeof ReviewPurchase>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Starterpack: Story = {
  args: {
    items: [
      {
        title: "Village",
        description: "Eternum Village",
        image: "https://r2.quddus.my/Frame%203231.png",
        type: StarterItemType.NFT,
        price: 100,
      },
      {
        title: "Credits",
        description: "Get 500 credits to use in the marketplace",
        value: 500,
        price: 500,
        image: "/ERC-20-Icon.svg",
        type: StarterItemType.CREDIT,
      },
    ],
    costDetails: {
      baseCostInCents: 1000,
      processingFeeInCents: 100,
      totalInCents: 1100,
    },
    platform: "starknet",
    isLoading: false,
  },
};

export const CreditsOnly: Story = {
  args: {
    items: [
      {
        title: "Credits",
        description: "Get 1000 credits to use in the marketplace",
        price: 1000,
        image: "/ERC-20-Icon.svg",
        type: StarterItemType.CREDIT,
      },
    ],
    costDetails: {
      baseCostInCents: 1000,
      processingFeeInCents: 100,
      totalInCents: 1100,
    },
    platform: "ethereum",
    isLoading: false,
  },
};

export const MultipleItems: Story = {
  args: {
    items: [
      {
        title: "Village",
        description: "Eternum Village",
        price: 100,
        image: "https://r2.quddus.my/Frame%203231.png",
        type: StarterItemType.NFT,
      },
      {
        title: "Warrior Pack",
        description: "Battle Collection",
        price: 100,
        image: "https://r2.quddus.my/Frame%203231.png",
        type: StarterItemType.NFT,
      },
      {
        title: "Credits",
        description: "Get 750 credits to use in the marketplace",
        price: 750,
        image: "/ERC-20-Icon.svg",
        type: StarterItemType.CREDIT,
      },
    ],
    costDetails: {
      baseCostInCents: 1000,
      processingFeeInCents: 100,
      totalInCents: 1100,
    },
    platform: "solana",
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    items: [
      {
        title: "Village",
        description: "Eternum Village",
        price: 100,
        image: "https://r2.quddus.my/Frame%203231.png",
        type: StarterItemType.NFT,
      },
      {
        title: "Credits",
        description: "Get 500 credits to use in the marketplace",
        price: 500,
        image: "/ERC-20-Icon.svg",
        type: StarterItemType.CREDIT,
      },
    ],
    costDetails: {
      baseCostInCents: 1000,
      processingFeeInCents: 100,
      totalInCents: 1100,
    },
    platform: "solana",
    isLoading: true,
  },
};
