import type { Meta, StoryObj } from "@storybook/react";
import { ClaimStarterPackInner } from "./starterpack";
import { ItemType, NavigationProvider } from "@/context";

const meta = {
  component: ClaimStarterPackInner,
  argTypes: {
    starterpackItems: {
      control: false, // Disable controls for BigInt serialization
    },
  },
  decorators: [
    (Story) => (
      <NavigationProvider>
        <Story />
      </NavigationProvider>
    ),
  ],
} satisfies Meta<typeof ClaimStarterPackInner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "Starterpack",
    starterpackItems: [
      {
        title: "Starter NFT",
        subtitle: "A unique starter NFT for your collection",
        icon: "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
        type: ItemType.NFT,
      },
    ],
  },
};

export const StarterPackWithNoSupply: Story = {
  args: {
    name: "Starterpack",
    supply: 0,
    isVerified: false,
    starterpackItems: [
      {
        title: "Starter NFT",
        subtitle: "A unique starter NFT for your collection",
        icon: "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
        type: ItemType.NFT,
      },
    ],
  },
};

export const StarterPackWithCollections: Story = {
  args: {
    name: "Starterpack",
    starterpackItems: [
      {
        title: "Starter NFT",
        subtitle: "A unique starter NFT for your collection",
        icon: "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
        type: ItemType.NFT,
      },
    ],
  },
};

export const StarterPackWithVerifiedEdition: Story = {
  args: {
    name: "Starterpack",
    edition: "Season 0: Genesis",
    isVerified: true,
    starterpackItems: [
      {
        title: "Starter NFT",
        subtitle: "A unique starter NFT for your collection",
        icon: "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
        type: ItemType.NFT,
      },
    ],
  },
};

export const StarterPackWithUnverifiedEdition: Story = {
  args: {
    name: "Starterpack",
    edition: "Season 0: Genesis",
    isVerified: false,
    starterpackItems: [
      {
        title: "Starter NFT",
        subtitle: "A unique starter NFT for your collection",
        icon: "https://fastly.picsum.photos/id/641/200/200.jpg?hmac=9pd71nRRRsT7TXf0zn0hQ6tW6VQnQ-UtL1JXDhJZB8E",
        type: ItemType.NFT,
      },
    ],
  },
};
