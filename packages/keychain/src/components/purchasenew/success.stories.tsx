import type { Meta, StoryObj } from "@storybook/react";
import { PurchaseSuccessInner } from "./success";
import { CreditIcon } from "@cartridge/ui";
import { ItemType } from "@/context/purchase";
import { StarterpackAcquisitionType } from "@cartridge/ui/utils/api/cartridge";

const meta = {
  component: PurchaseSuccessInner,
} satisfies Meta<typeof PurchaseSuccessInner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Credits: Story = {
  args: {
    acquisitionType: StarterpackAcquisitionType.Paid,
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
    acquisitionType: StarterpackAcquisitionType.Paid,
    items: [
      {
        title: "Village pass",
        icon: "https://r2.quddus.my/Frame%203231.png",
        type: ItemType.NFT,
      },
    ],
  },
};
