import type { Meta, StoryObj } from "@storybook/react";
import { OnchainStarterPackInner } from "./starterpack";
import { NavigationProvider } from "@/context";

const meta = {
  component: OnchainStarterPackInner,
  argTypes: {
    items: {
      control: false,
    },
  },
  decorators: [
    (Story) => (
      <NavigationProvider>
        <Story />
      </NavigationProvider>
    ),
  ],
} satisfies Meta<typeof OnchainStarterPackInner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "Onchain Starterpack",
    description: "A collection of items for your game",
    items: [
      {
        name: "Starter NFT",
        description: "A unique starter NFT for your collection",
        imageUri:
          "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
      },
    ],
    quote: {
      basePrice: 1000000n,
      referralFee: 0n,
      protocolFee: 50000n,
      totalCost: 1050000n,
      paymentToken: "0x123",
      paymentTokenMetadata: {
        symbol: "USDC",
        decimals: 6,
      },
    },
  },
};

export const WithoutQuote: Story = {
  args: {
    name: "Onchain Starterpack",
    description: "Loading pricing...",
    items: [
      {
        name: "Starter NFT",
        description: "A unique starter NFT for your collection",
        imageUri:
          "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
      },
    ],
    quote: null,
  },
};
