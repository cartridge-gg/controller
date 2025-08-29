import type { Meta, StoryObj } from "@storybook/react";
import { PurchasePendingInner } from "./pending";
import { CreditIcon } from "@cartridge/ui";
import { ItemType } from "@/context/purchase";

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
        icon: <CreditIcon />,
        value: 1000,
        type: ItemType.CREDIT,
      },
    ],
  },
};

export const NFT: Story = {
  args: {
    items: [
      {
        title: "Village pass",
        icon: "https://r2.quddus.my/Frame%203231.png",
        type: ItemType.NFT,
      },
    ],
  },
};
