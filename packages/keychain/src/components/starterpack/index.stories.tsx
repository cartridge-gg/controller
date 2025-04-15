import { StarterItemData, StarterItemType, StarterPackProvider } from "@/context/starterpack";
import type { Meta, StoryObj } from "@storybook/react";



const meta = {
  component: StarterPackProvider,
} satisfies Meta<typeof StarterPackProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    balance: 10,
    price: 5,
    starterPackItems: [
      {
        title: "Village",
        collectionName: "Eternum Village",
        description:
          "Villages are the basic building block of eternum, they allow you to produce troops and resources.",
        price: 5,
        image: "https://r2.quddus.my/Frame%203231.png",
        type: StarterItemType.NFT,
      } as StarterItemData,
      {
        title: "20 Credits",
        description: "Credits cover service fee(s) in Eternum.",
        price: 0,
        image: "/ERC-20-Icon.svg",
        type: StarterItemType.CREDIT,
        value: 50,
      } as StarterItemData,
    ]
  },
};
