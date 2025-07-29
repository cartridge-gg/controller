import type { Meta, StoryObj } from "@storybook/react";
import { ReviewPurchase } from "./review";
import { PurchaseItemType } from "../types";
import { EthereumIcon, SolanaIcon, StarknetIcon } from "@cartridge/ui";

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
        subtitle: "Eternum Village",
        icon: "https://r2.quddus.my/Frame%203231.png",
        type: PurchaseItemType.NFT,
      },
      {
        title: "Credits",
        value: 500,
        icon: "/ERC-20-Icon.svg",
        type: PurchaseItemType.CREDIT,
      },
    ],
    costDetails: {
      baseCostInCents: 1000,
      processingFeeInCents: 100,
      totalInCents: 1100,
    },
    network: {
      id: "ethereum",
      name: "Ethereum",
      icon: <StarknetIcon />,
      wallets: [],
    },
    isLoading: false,
  },
};

export const CreditsOnly: Story = {
  args: {
    items: [
      {
        title: "Credits",
        value: 1000,
        icon: "/ERC-20-Icon.svg",
        type: PurchaseItemType.CREDIT,
      },
    ],
    costDetails: {
      baseCostInCents: 1000,
      processingFeeInCents: 100,
      totalInCents: 1100,
    },
    network: {
      id: "ethereum",
      name: "Ethereum",
      icon: <EthereumIcon />,
      wallets: [],
    },
    isLoading: false,
  },
};

export const MultipleItems: Story = {
  args: {
    items: [
      {
        title: "Village",
        subtitle: "Eternum Village",
        icon: "https://r2.quddus.my/Frame%203231.png",
        type: PurchaseItemType.NFT,
      },
      {
        title: "Warrior Pack",
        subtitle: "Battle Collection",
        icon: "https://r2.quddus.my/Frame%203231.png",
        type: PurchaseItemType.NFT,
      },
      {
        title: "Credits",
        value: 750,
        icon: "/ERC-20-Icon.svg",
        type: PurchaseItemType.CREDIT,
      },
    ],
    costDetails: {
      baseCostInCents: 1000,
      processingFeeInCents: 100,
      totalInCents: 1100,
    },
    network: {
      id: "solana",
      name: "Solana",
      icon: <SolanaIcon />,
      wallets: [],
    },
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    items: [
      {
        title: "Village",
        subtitle: "Eternum Village",
        icon: "https://r2.quddus.my/Frame%203231.png",
        type: PurchaseItemType.NFT,
      },
      {
        title: "Credits",
        value: 500,
        icon: "/ERC-20-Icon.svg",
        type: PurchaseItemType.CREDIT,
      },
    ],
    costDetails: {
      baseCostInCents: 1000,
      processingFeeInCents: 100,
      totalInCents: 1100,
    },
    network: {
      id: "solana",
      name: "Solana",
      icon: <SolanaIcon />,
      wallets: [],
    },
    isLoading: true,
  },
};
