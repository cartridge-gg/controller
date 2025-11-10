import type { Meta, StoryObj } from "@storybook/react";
import { StarterItem } from "./starter-item";
import { ItemType } from "@/context";

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

export const FancyCard: Story = {
  args: {
    type: ItemType.NFT,
    title: "Starter NFT",
    subtitle: "A unique starter NFT for your collection",
    icon: "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
    value: 100,
    fancy: true,
  },
};

export const NFT: Story = {
  args: {
    type: ItemType.NFT,
    title: "Starter NFT",
    subtitle: "A unique starter NFT for your collection",
    icon: "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
    value: 100,
  },
};

export const Credit: Story = {
  args: {
    type: ItemType.ERC20,
    title: "100 Credits",
    subtitle: "Get 100 credits to use in the marketplace",
    icon: "https://static.cartridge.gg/presets/credit/icon.svg",
    value: 100,
  },
};

export const FreeCredit: Story = {
  args: {
    type: ItemType.CREDIT,
    title: "Free Credits",
    subtitle: "Get 50 free credits to start your journey",
    icon: "https://static.cartridge.gg/presets/credit/icon.svg",
    value: 50,
  },
};
