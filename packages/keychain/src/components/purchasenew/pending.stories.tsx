import type { Meta, StoryObj } from "@storybook/react";
import { PurchasePendingInner } from "./pending";
import { CreditIcon } from "@cartridge/ui";
import { StarterItemType } from "@/hooks/starterpack";

const meta = {
  component: PurchasePendingInner,
} satisfies Meta<typeof PurchasePendingInner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Credits: Story = {
  args: {
    items: [
      {
        title: "Credits",
        description: "Get 1000 credits to use in the marketplace",
        image: CreditIcon.toString(),
        price: 1000,
        type: StarterItemType.CREDIT,
      },
    ],
  },
};

export const NFT: Story = {
  args: {
    items: [
      {
        title: "Village pass",
        description: "Eternum Village",
        price: 100,
        image: "https://r2.quddus.my/Frame%203231.png",
        type: StarterItemType.NFT,
      },
    ],
  },
};
