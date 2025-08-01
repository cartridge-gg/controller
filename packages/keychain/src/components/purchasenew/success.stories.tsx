import type { Meta, StoryObj } from "@storybook/react";
import { PurchaseSuccessInner } from "./success";
import { CreditIcon } from "@cartridge/ui";
import { PurchaseItemType } from "@/context/purchase";

const meta = {
  component: PurchaseSuccessInner,
} satisfies Meta<typeof PurchaseSuccessInner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Credits: Story = {
  args: {
    items: [
      {
        title: "Credits",
        icon: <CreditIcon />,
        value: 1000,
        type: PurchaseItemType.CREDIT,
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
        type: PurchaseItemType.NFT,
      },
    ],
  },
};
