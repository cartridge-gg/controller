import type { Meta, StoryObj } from "@storybook/react";
import { StarterItem } from "./starter-item";
import { StarterItemType } from "@/hooks/starterpack";

const meta: Meta<typeof StarterItem> = {
  component: StarterItem,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StarterItem>;

export const NFT: Story = {
  args: {
    type: StarterItemType.NFT,
    title: "Starter NFT",
    description: "A unique starter NFT for your collection",
    image:
      "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
    price: 100,
  },
};

export const Credit: Story = {
  args: {
    type: StarterItemType.CREDIT,
    title: "100 Credits",
    description: "Get 100 credits to use in the marketplace",
    image: "https://static.cartridge.gg/presets/credit/icon.svg",
    price: 10,
    value: 100,
  },
};

export const FreeCredit: Story = {
  args: {
    type: StarterItemType.CREDIT,
    title: "Free Credits",
    description: "Get 50 free credits to start your journey",
    image: "https://static.cartridge.gg/presets/credit/icon.svg",
    price: 0,
    value: 50,
  },
};
