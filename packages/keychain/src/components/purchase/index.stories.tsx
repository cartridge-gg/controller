import type { Meta, StoryObj } from "@storybook/react";
import { Purchase, PurchaseState } from ".";
import { WalletsProvider } from "@/hooks/wallets";
import { PurchaseType } from "@cartridge/ui/utils/api/cartridge";
import { StarterpackAcquisitionType } from "@cartridge/ui/utils/api/cartridge";
import { StarterPackItemType } from "@cartridge/controller";

const meta = {
  component: Purchase,
} satisfies Meta<typeof Purchase>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PurchaseCredits: Story = {
  args: {
    type: PurchaseType.Credits,
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
    type: PurchaseType.Starterpack,
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
      acquisitionType: StarterpackAcquisitionType.Paid,
      mintAllowance: {
        count: 0,
        limit: 1,
      },
      starterPackItems: [
        {
          name: "Booster Pack",
          description: "Contains random playable agents",
          price: 0n,
          iconURL:
            "https://storage.googleapis.com/c7e-prod-static/media/chaos.png",
          type: StarterPackItemType.NONFUNGIBLE,
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
    type: PurchaseType.Starterpack,
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
      acquisitionType: StarterpackAcquisitionType.Paid,
      mintAllowance: {
        count: 1,
        limit: 1,
      },
      starterPackItems: [
        {
          name: "Booster Pack",
          description: "Contains random playable agents",
          price: 0n,
          iconURL:
            "https://storage.googleapis.com/c7e-prod-static/media/chaos.png",
          type: StarterPackItemType.NONFUNGIBLE,
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
    type: PurchaseType.Starterpack,
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
      acquisitionType: StarterpackAcquisitionType.Paid,
      starterPackItems: [
        {
          name: "Village",
          description:
            "Villages are the basic building block of eternum, they allow you to produce troops and resources.",
          price: 5n,
          iconURL: "https://r2.quddus.my/Frame%203231.png",
          type: StarterPackItemType.NONFUNGIBLE,
        },
        {
          name: "20 Credits",
          description: "Credits cover service fee(s) in Eternum.",
          price: 0n,
          iconURL: "/ERC-20-Icon.svg",
          type: StarterPackItemType.FUNGIBLE,
          amount: 50,
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
    type: PurchaseType.Starterpack,
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
      acquisitionType: StarterpackAcquisitionType.Paid,
      starterPackItems: [
        {
          name: "Village",
          description:
            "Villages are the basic building block of eternum, they allow you to produce troops and resources.",
          price: 5n,
          iconURL: "https://r2.quddus.my/Frame%203231.png",
          type: StarterPackItemType.NONFUNGIBLE,
        },
        {
          name: "20 Credits",
          description: "Credits cover service fee(s) in Eternum.",
          price: 0n,
          iconURL: "/ERC-20-Icon.svg",
          type: StarterPackItemType.FUNGIBLE,
          amount: 50,
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
    type: PurchaseType.Starterpack,
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
      acquisitionType: StarterpackAcquisitionType.Paid,
      starterPackItems: [
        {
          name: "Village",
          description:
            "Villages are the basic building block of eternum, they allow you to produce troops and resources.",
          price: 5n,
          iconURL: "https://r2.quddus.my/Frame%203231.png",
          type: StarterPackItemType.NONFUNGIBLE,
        },
        {
          name: "20 Credits",
          description: "Credits cover service fee(s) in Eternum.",
          price: 0n,
          iconURL: "/ERC-20-Icon.svg",
          type: StarterPackItemType.FUNGIBLE,
          amount: 50,
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
    type: PurchaseType.Credits,
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
    type: PurchaseType.Starterpack,
    wallets: [],
    initState: PurchaseState.SUCCESS,
    starterpackDetails: {
      id: "1",
      name: "Starter Pack Name",
      priceUsd: 100,
      acquisitionType: StarterpackAcquisitionType.Paid,
      starterPackItems: [
        {
          name: "Village",
          description:
            "Villages are the basic building block of eternum, they allow you to produce troops and resources.",
          price: 5n,
          iconURL: "https://r2.quddus.my/Frame%203231.png",
          type: StarterPackItemType.NONFUNGIBLE,
        },
        {
          name: "20 Credits",
          description: "Credits cover service fee(s) in Eternum.",
          price: 0n,
          iconURL: "/ERC-20-Icon.svg",
          type: StarterPackItemType.FUNGIBLE,
          amount: 50,
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
