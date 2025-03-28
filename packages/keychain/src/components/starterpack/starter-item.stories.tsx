import type { Meta, StoryObj } from "@storybook/react";
import { StarterItem } from "./starter-item";

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
    type: "NFT",
    title: "Starter NFT",
    description: "A unique starter NFT for your collection",
    image: "https://picsum.photos/200",
    price: 100,
  },
};

export const Credit: Story = {
  args: {
    type: "CREDIT",
    title: "100 Credits",
    description: "Get 100 credits to use in the marketplace",
    image: "https://static.cartridge.gg/presets/credit/icon.svg",
    price: 10,
    value: 100,
  },
};

export const FreeCredit: Story = {
  args: {
    type: "CREDIT",
    title: "Free Credits",
    description: "Get 50 free credits to start your journey",
    image: "https://static.cartridge.gg/presets/credit/icon.svg",
    price: 0,
    value: 50,
  },
};
