import type { Meta, StoryObj } from "@storybook/react";
import { PurchaseSuccessInner } from "./success";
import { CreditIcon } from "@cartridge/ui";
import { ItemType } from "@/context";

const meta = {
  component: PurchaseSuccessInner,
} satisfies Meta<typeof PurchaseSuccessInner>;

export default meta;

type Story = StoryObj<typeof meta>;

const TOKEN_ICONS = {
  USDC: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e5aaa970-a998-47e8-bd43-4a3b56b87200/logo",
  STRK: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/1b126320-367c-48ed-cf5a-ba7580e49600/logo",
  ETH: "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo",
  LORDS:
    "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo",
};

export const Credits: Story = {
  args: {
    type: "onchain",
    items: [
      {
        title: "Credits",
        icon: <CreditIcon />,
        value: 1000,
        type: ItemType.CREDIT,
      },
    ],
  },
};

export const NFT: Story = {
  args: {
    type: "onchain",
    items: [
      {
        title: "Village pass",
        icon: "https://r2.quddus.my/Frame%203231.png",
        type: ItemType.NFT,
      },
    ],
  },
};

export const TokenPurchase: Story = {
  args: {
    type: "onchain",
    items: [
      {
        title: "USDC",
        subtitle: "100 USDC tokens",
        icon: TOKEN_ICONS.USDC,
        value: 100,
        type: ItemType.ERC20,
      },
      {
        title: "ETH",
        subtitle: "0.5 Ethereum",
        icon: TOKEN_ICONS.ETH,
        value: 0.5,
        type: ItemType.ERC20,
      },
    ],
  },
};

export const MixedPurchase: Story = {
  args: {
    type: "onchain",
    items: [
      {
        title: "Credits",
        icon: <CreditIcon />,
        value: 2000,
        type: ItemType.CREDIT,
      },
      {
        title: "STRK",
        subtitle: "1000 Starknet tokens",
        icon: TOKEN_ICONS.STRK,
        value: 1000,
        type: ItemType.ERC20,
      },
      {
        title: "Rare Artifact",
        icon: "https://r2.quddus.my/Frame%203231.png",
        type: ItemType.NFT,
      },
    ],
  },
};

export const ClaimedItems: Story = {
  args: {
    type: "claimed",
    items: [
      {
        title: "Credits",
        icon: <CreditIcon />,
        value: 500,
        type: ItemType.CREDIT,
      },
      {
        title: "LORDS",
        subtitle: "50 LORDS gaming tokens",
        icon: TOKEN_ICONS.LORDS,
        value: 50,
        type: ItemType.ERC20,
      },
      {
        title: "Welcome NFT",
        icon: "https://r2.quddus.my/Frame%203231.png",
        type: ItemType.NFT,
      },
    ],
  },
};
