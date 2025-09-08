import type { Meta, StoryObj } from "@storybook/react";
import { PurchaseSuccessInner } from "./success";
import { CreditIcon } from "@cartridge/ui";
import { StarterpackAcquisitionType } from "@cartridge/ui/utils/api/cartridge";
import { StarterItemType } from "@/hooks/starterpack";

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
    acquisitionType: StarterpackAcquisitionType.Paid,
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
